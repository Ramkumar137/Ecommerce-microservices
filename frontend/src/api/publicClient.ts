import axios from "axios";

const publicClient = axios.create({
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default publicClient;