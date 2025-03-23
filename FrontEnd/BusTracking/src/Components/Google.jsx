import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import React,{useState} from 'react'
import { sendData } from './Axious';

function Google() {
  const [userData , setUserData] = useState({});
  return (
    <GoogleLogin
          onSuccess={credentialResponse => {
          setUserData(jwtDecode(credentialResponse.credential));
          console.log(jwtDecode(credentialResponse.credential))
            }}
            onError={() => {
            console.log('Login Failed');
          }}
/>
  )
}

export default Google