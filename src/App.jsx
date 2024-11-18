import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import Navbar from './components/navbar/navbar';

export default function App() {

  return (
    <div className="App">
      <Navbar />
      <main>
          <div id="content" className="content">
            <section id="start" className="start">    
                <img className="hello" src="/feathered_ohhello.png" alt="text: Oh, Hello!" />
            </section>
            <section id="personal" className="personal">
                <div className="info">
                  <h1>Hi, I am Aada. Nice to meet you!</h1>
                  <p>
                    I study Information Technology at Tampere University, my major being telecommunications and minor software engineering.
                  </p>
                  <p>
                    My interests include telecommunications, network design and programming. This website is my ongoing personal project, but I am also a part of small team of game developers, Rake Entertainment. 
                    You can check out our website at: <a href="https://rake-entertainment.com ">Rake Entertainment</a>
                    Aside from tech, I enjoy handcrafts, hiking and volunteering at a children's church.
                  </p>
                </div>   
                <aside id="photo">
                  <img className="portrait" src="/resumepic.JPG" alt="portrait of Aada" />
                  </aside>          
            </section>
            <section id="work" className="work">
              <h1>Other info soon to be added!</h1>
              <p>If you wan't to know more, send me an e-mail or feel free to call.</p>
            </section>
          </div>
      </main>
      <footer className="footer">
        <p>reach out:</p>
        <p>aada.harma@tuni.fi</p>
        <p>LinkedIn: Aada Härmä</p>
        <a href="https://github.com/aadaharma">GitHub</a>
      </footer>
    </div>
  );
}
