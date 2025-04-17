import axios from "axios";
import cron from "node-cron";

const scheduleJobs = () => {
  cron.schedule('12 11 * * *', async () => {
    try {
      const res = await axios.get('http://localhost:8000/react/call');
      console.log('API called successfully at 6PM');
    } catch (err) {
      console.error('Failed to call API:', err.message);
    }
  });
};


export default scheduleJobs;
