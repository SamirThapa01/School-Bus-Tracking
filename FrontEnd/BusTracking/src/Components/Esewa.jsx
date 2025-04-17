function Esewa() {
    const [orders, setOrders] = useState([]);
    const handleEsewaPayment = async () => {
      const url = "http://localhost:8000/esewa";
      const data = {
        amount: 100,
        products: [{ product: "test", amount: 100, quantity: 1 }],
      };
  
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Add any other headers as needed
          },
          body: JSON.stringify(data),
        });
  
        // Check if the request was successful (status code 2xx)
        if (response.ok) {
          const responseData = await response.json();
          console.log(responseData);
          esewaCall(responseData.formData);
        } else {
          console.error("Failed to fetch:", response.status, response.statusText);
        }
      } catch (error) {
        console.error("Error during fetch:", error);
      }
    };

  }

  export default Esewa