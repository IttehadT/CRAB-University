// // If the env var exists (Production), use it. Otherwise, fallback to localhost for your laptop.
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// export const api = {
//   // Check if server is running
//   getHealth: async () => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/health`);
//       if (!res.ok) throw new Error("Server error");
//       return await res.json();
//     } catch (error) {
//       console.error("API Fetch Error:", error);
//       return null;
//     }
//   },
// };