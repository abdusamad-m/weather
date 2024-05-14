import React from 'react'
import './page.css'
import { useState,useEffect } from 'react'
import {getwheatherdata} from './wheatherdata'
import search_icon from './Assets/search.png'
import wind from './Assets/wind.png'
import humudity from'./Assets/humidity.png'


function Page() {
    const [wheatherdata,setwheatherdata]= useState(null)
    const [city,setcity]= useState()
    const[loading,setloadin] =useState (false)

    const getdata = async()=>{
        try{
            
            const data = await getwheatherdata(city)
            setwheatherdata(data)
            console.log(data);
        }catch (error){
            console.log(error.messege);
            
        }
    }

   
    
    
  return (
    <>
    <div className='root'>

        <div style={{display:'flex', flexDirection:'row',gap:'40px',width:'100%',justifyContent:'center',alignItems:'center'}}> 
            <input type="text" className='text' onChange={(e)=>setcity(e.target.value)}/>
            <button className='btn' onClick={getdata}><img src={search_icon} alt="" /></button>
        </div>
       
       {wheatherdata !== null? (
                <>
                <img src={`http://openweathermap.org/img/w/${wheatherdata.weather[0].icon}.png`} className="status" />
                <h1 className='temp'>{parseFloat(wheatherdata.main.temp - 273.15).toFixed(1)}</h1> 
                <h1 className='place'>{wheatherdata.name}</h1>
                <div className='ww'>
                    <div style={{display:'flex', gap:'3px'}}><img src={humudity} alt=""  /> 
                        <div style={{display:'flex', gap:'px', flexDirection:'column' }}>{wheatherdata.main.humidity}% 
                            <p style={{marginTop:'0px'}}>  humidity</p>
                        </div>
                    </div>
                    <div style={{display:'flex', gap:'3px'}}><img src={wind} alt="" /> 
                        <div style={{display:'flex', gap:'3px', flexDirection:'column'}}>
                            {wheatherdata.wind.speed}km/h 
                            <p style={{marginTop:'0px'}}>  windspeed</p>
                        </div>
                    </div>
                </div>
                </>
       ): null}
       
    </div>
    </>
  )
}

export default Page