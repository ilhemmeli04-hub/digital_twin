import React from "react";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";
import incubatorImg from "./assets/incubator .png";
import logoUniv from "./assets/logouniv.png";

import {
  Activity,
  History,
  Box,
  BarChart3,
  Cpu,
  Cuboid
} from "lucide-react";

export default function Dashboard() {

  const navigate = useNavigate();

  const cards = [
    {
      title: "Monitoring",
      icon: <Activity size={55} />,
      path: "/monitoring"
    },

    {
      title: "History",
      icon: <History size={55} />,
      path: "/history"
    },

    {
      title: "3D View",
      icon: <Box size={55} />,
      path: "/3dview"
    },

    {
      title: "Graphs",
      icon: <BarChart3 size={55} />,
      path: "/graphs"
    },

    {
      title: "Simulation",
      icon: <Cpu size={55} />,
      path: "/simulation"
    },


  ];

  return (
    <div className="page">

      <div className="navbar">

        <h1>
          Digital Twin: Infant Incubator System
        </h1>
        

       <div className="user">

  <img
    src={logoUniv}
    alt="logo Univ"
    className="logo"
  />

  <span>Welcome, Eng. Ali</span>

</div>
      </div>

      <div className="cards-container">

        {cards.map((card, index) => (

          <div
            className="card"
            key={index}
            onClick={() => navigate(card.path)}
          >

            <div className="icon">
              {card.icon}
            </div>

            <h2>{card.title}</h2>

          </div>

        ))}

      </div>

      

    </div>
  );
}