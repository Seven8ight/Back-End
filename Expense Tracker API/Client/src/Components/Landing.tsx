import { Link } from "react-router";
import { motion } from "motion/react";
import Lottie from "lottie-react";
import RevenueAnim from "./../Assets/Lotties/Revenue.json";
import ManageAnim from "./../Assets/Lotties/Money Investment.json";
import CRUDAnim from "./../Assets/Lotties/Isometric data analysis.json";
import VisualAnim from "./../Assets/Lotties/Bouncing Graph.json";
import ContactSvg from "./../Assets/Svg/undraw_messaging_1s2k.svg";
import React, { useEffect, useState } from "react";

const Landing = (): React.ReactNode => {
  const [email, setEmail] = useState<string>(""),
    [message, setMsg] = useState<string>(""),
    [accountPresent, setPresent] = useState<boolean>(false);

  const contactFormHandler = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  useEffect(() => {
    const userTokens = localStorage.getItem("userTokens");

    if (userTokens) {
      const { accessToken } = JSON.parse(userTokens);

      (async () => {
        try {
          if (accessToken) {
            let userRequest: Response = await fetch(
              "http://localhost:3000/accounts/user",
              {
                method: "GET",
                headers: {
                  authorization: accessToken,
                },
              }
            );

            if (userRequest.status == 200) setPresent(true);
            else setPresent(false);
          } else setPresent(false);
        } catch (error) {
          setPresent(false);
        }
      })();
    }
  }, []);

  return (
    <div id="Landing">
      <motion.header id="header">
        <h1>Expenso</h1>
        <div>
          <motion.a href="#home">Home</motion.a>
          <motion.a href="#features">Features</motion.a>
          <motion.a href="#contact">Contact</motion.a>
        </div>
        <div>
          {accountPresent ? (
            <Link to="/home">
              <i className="fa-solid fa-user"></i>
            </Link>
          ) : (
            <Link to="/auth">
              <i className="fa-solid fa-user-plus"></i>
            </Link>
          )}
        </div>
      </motion.header>
      <div id="home">
        <div id="txt">
          <h1>Expenses tracked</h1>
          <p>
            Manage and track all your expenses from a strategic end point
            <br /> both visually and graphically.
          </p>
          <button>Get Started</button>
        </div>
        <div id="svg">
          <Lottie animationData={RevenueAnim} loop={true} />
        </div>
      </div>
      <div id="features">
        <div id="CRUD">
          <div id="text">
            <h1>CRUD operations</h1>
            <p>
              Be able to create, read, update and delete expenses within the
              application
            </p>
          </div>
          <div id="svg">
            <Lottie animationData={CRUDAnim} loop={true} />
          </div>
        </div>
        <div id="manage">
          <div id="text">
            <h1>Manage expenses efficiently</h1>
            <p>
              Be able to manage your expenses efficiently with visually detailed
              designs
            </p>
          </div>
          <div id="svg">
            <Lottie animationData={ManageAnim} loop={true} />
          </div>
        </div>
        <div id="Visualize">
          <div id="text">
            <h1>Visualize data</h1>
            <p>
              Be able to view your expenses from a graphical point of view for
              more detailed explanation
            </p>
          </div>
          <div id="svg">
            <Lottie animationData={VisualAnim} loop={true} />
          </div>
        </div>
      </div>
      <div id="contact">
        <h2>Contact us</h2>
        <div id="image">
          <img src={ContactSvg} />
        </div>
        <div id="divider" />
        <div id="form">
          <form onSubmit={(event) => contactFormHandler(event)}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <br />
            <label htmlFor="message">Message</label>
            <br />
            <textarea
              id="message"
              rows={10}
              cols={10}
              value={message}
              onChange={(event) => setMsg(event.target.value)}
            />
            <br />
            <button type="submit">Send</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Landing;
