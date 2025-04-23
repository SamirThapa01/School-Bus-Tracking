import axios from "axios";
import cron from "node-cron";

const scheduleJobs = () => {
  cron.schedule('18 10 * * *', async () => {
    try {
      const res = await axios.patch('http://localhost:8000/react/update/attendance');
      console.log('API called successfully at 6PM');
    } catch (err) {
      console.error('Failed to call API:', err.message);
    }
  });
};


export default scheduleJobs;
