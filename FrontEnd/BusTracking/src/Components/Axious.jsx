import axios from 'axios'
const sendData = async (URL,Data) => {
    if (!URL) {
        return [null,"no url"];
    }

    try{
        const response = await axios.post(URL,Data,{
            withCredentials: true
        });
        return [response.data,null]; 
    }
    catch(error){
        return [null,error];
    }
}

export {sendData};