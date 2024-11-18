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
                    My interests include cloud engineering, testing software and game development. Gaming is one of my dearest hobbies, and learning to program games myself has been rewarding.
                    Aside from tech, I enjoy hiking and volunteering at a children's church.
                  </p>
                </div>   
                <aside id="photo">
                  <img className="portrait" src="/resumepic.JPG" alt="portrait of Aada" />
                  </aside>          
            </section>
            //            <section id="exp" className="exp">
            //              <h1>My work experience</h1>
            //              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed d</p>
            //              <aside id="expdiag">
            //                <p>Here maybe experience circle diagrams</p>
            //              </aside>
            //            </section>
            <section id="work" className="work">
              <h1>Portfolio?</h1>
              <p>Woopswoops</p>
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
