import { motion } from "framer-motion";

export default function Tiles({ jobIds }) {
  if (!jobIds || jobIds.length === 0) {
    return (
      <div className="mt-10 w-full max-w-2xl mx-auto text-center text-gray-300 text-lg">
        No jobs uploaded yet.
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto mt-10 space-y-6">
      <h2 className="text-3xl font-bold text-blue-300 text-center mb-4">
        Uploaded Jobs
      </h2>

      {/* Grid of tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobIds.map((id, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="p-5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl 
                       flex flex-col space-y-3 hover:scale-[1.03] hover:bg-white/20 transition"
          >
            <p className="text-gray-200 text-sm tracking-wide">Job #{index + 1}</p>

            <p className="text-blue-300 font-bold break-all">
              {id}
            </p>

            <button
              className="py-2 px-4 rounded-xl bg-blue-500 hover:bg-blue-600 transition 
                         text-white font-semibold shadow-md"
            >
              View Details
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
