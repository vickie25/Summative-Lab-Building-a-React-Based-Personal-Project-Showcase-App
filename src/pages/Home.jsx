import React from 'react'
import '../css/Home.css'
import Navbar from '../components/Navbar'


function Home() {
  return (
    <main >
      <div className="overlay">
        <div className="landing-page">
          <Navbar/>
        </div>
      </div>
      
    </main>
    
  )
}

export default Home
