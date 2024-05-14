import axios from "axios";

const baseurl = 'https://api.openweathermap.org/data/2.5/weather?'
const apikey = 'aee337f68bbfc1d44662b6616e8ee258'

export const getwheatherdata = async (cityname)=>{
    try{
        const {data} =await axios.get(baseurl + `q=${cityname}&appid=${apikey}`);
        return data;

    }
    catch(error){
        throw error;
    }
}