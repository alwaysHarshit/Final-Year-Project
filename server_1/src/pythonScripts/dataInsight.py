import sys
import pandas as pd
import numpy as np
import json
import os

# Set encoding to handle special characters in output
sys.stdout.reconfigure(encoding='utf-8')

# === CONFIG ===
try:
    file_name = sys.argv[1]
except IndexError:
    # Fallback for testing if no argument is provided
    print("Error: No filename provided via command line arguments.")
    sys.exit(1)

# Paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
FILE_PATH = os.path.abspath(os.path.join(SCRIPT_DIR, "..", "..", "..", "shared", "dataset", file_name))
OUTPUT_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, "..", "..", "..", "shared", "metaFiles"))

# Ensure output directory exists
os.makedirs(OUTPUT_DIR, exist_ok=True)

class NpEncoder(json.JSONEncoder):
    """
    Custom JSON Encoder to handle NumPy types (int64, float64, NaN, etc.)
    that are not natively serializable by the standard json library.
    """
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.floating):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        if isinstance(obj, (bool, np.bool_)):
            return bool(obj)
        if pd.isna(obj):
            return None  # Convert NaN/NaT to JSON null
        return super(NpEncoder, self).default(obj)

def load_data(path):
    """Loads CSV or Excel files with robust encoding handling."""
    file_ext = os.path.splitext(path)[1].lower()

    try:
        if file_ext == '.csv':
            # Try default utf-8, fallback to latin1 if that fails
            try:
                return pd.read_csv(path)
            except UnicodeDecodeError:
                return pd.read_csv(path, encoding='latin1')
        elif file_ext in ['.xlsx', '.xls']:
            return pd.read_excel(path)
        else:
            raise ValueError(f"Unsupported file format: {file_ext}")
    except FileNotFoundError:
        print(f"Error: File not found at {path}")
        sys.exit(1)
    except Exception as e:
        print(f"Error loading file: {str(e)}")
        sys.exit(1)

def analyze_column(series):
    """
    Performs deep analysis on a single column to determine quality and content.
    """
    col_type = str(series.dtype)
    n_total = len(series)
    n_null = series.isnull().sum()
    n_unique = series.nunique()

    # Basic Stats
    stats = {
        "dtype": col_type,
        "count": n_total,
        "missing_count": n_null,
        "missing_percentage": round((n_null / n_total) * 100, 2),
        "unique_count": n_unique,
        "is_unique": n_unique == n_total,
        "sample_values": series.dropna().head(5).tolist()
    }

    # Detect if it's potentially an ID column (high cardinality, non-numeric or integer)
    if n_unique > (n_total * 0.9) and n_total > 50:
        stats["inference_hint"] = "possible_id"

    # Specific Logic for Numerical Data
    if np.issubdtype(series.dtype, np.number):
        desc = series.describe()
        stats.update({
            "mean": desc.get('mean'),
            "std": desc.get('std'),
            "min": desc.get('min'),
            "max": desc.get('max'),
            "median": series.median(),
            "zeros_count": (series == 0).sum(),
            "negative_count": (series < 0).sum(),
            "type_category": "numeric"
        })

    # Specific Logic for String/Object Data
    elif series.dtype == 'object':
        # Check if it contains mixed types (numbers and strings)
        numeric_convertible = pd.to_numeric(series, errors='coerce').notna().sum()
        is_mixed = 0 < numeric_convertible < (n_total - n_null)

        # Check for consistency issues
        non_null_series = series.dropna().astype(str)
        avg_len = non_null_series.map(len).mean() if not non_null_series.empty else 0

        # Whitespace analysis (leading/trailing spaces)
        whitespace_issues = non_null_series.str.strip() != non_null_series
        whitespace_count = whitespace_issues.sum()

        stats.update({
            "avg_string_length": avg_len,
            "possible_mixed_types": is_mixed,
            "numeric_convertible_count": numeric_convertible,
            "whitespace_issues_count": whitespace_count,
            "empty_string_count": (non_null_series == "").sum(),
            "type_category": "categorical_or_text"
        })

        # Inference: Is this actually a categorical column?
        if n_unique < 20 or (n_unique < n_total * 0.05):
            stats["inference_hint"] = "categorical"
            # Get frequency distribution for top 10 items
            stats["top_categories"] = series.value_counts().head(10).to_dict()

    # Logic for Datetime
    elif np.issubdtype(series.dtype, np.datetime64):
        stats.update({
            "min_date": str(series.min()),
            "max_date": str(series.max()),
            "type_category": "datetime"
        })

    return stats

def generate_insights():
    print(f"Processing file: {FILE_PATH}...")
    df = load_data(FILE_PATH)

    # 1. Dataset Level Metadata
    dataset_summary = {
        "file_name": file_name,
        "total_rows": df.shape[0],
        "total_columns": df.shape[1],
        "memory_usage_mb": round(df.memory_usage(deep=True).sum() / 1024 / 1024, 2),
        "duplicate_rows": df.duplicated().sum(),
        "column_names": list(df.columns)
    }

    # 2. Column Level Analysis
    column_insights = {}
    for col in df.columns:
        column_insights[col] = analyze_column(df[col])

    # 3. Correlation (for numeric only) - useful for redundancy checks
    numeric_df = df.select_dtypes(include=[np.number])
    correlations = {}
    if not numeric_df.empty and numeric_df.shape[1] > 1:
        # Only take high correlations to save space
        corr_matrix = numeric_df.corr().abs()
        upper = corr_matrix.where(np.triu(np.ones(corr_matrix.shape), k=1).astype(bool))
        high_corr = [column for column in upper.columns if any(upper[column] > 0.95)]
        correlations["high_collinearity_warning"] = high_corr

    # 4. Construct Final JSON Structure
    final_output = {
        "dataset_summary": dataset_summary,
        "column_insights": column_insights,
        "correlations": correlations,
        "sample_data": df.head(5).to_dict(orient='records') # Small sample for context
    }

    # 5. Save to File
    output_filename = f"{os.path.splitext(file_name)[0]}_insights.json"
    output_path = os.path.join(OUTPUT_DIR, output_filename)

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(final_output, f, cls=NpEncoder, indent=4)

    print(json.dumps({"output_path": output_path,"output_filename": output_filename}))

if __name__ == "__main__":
    generate_insights()