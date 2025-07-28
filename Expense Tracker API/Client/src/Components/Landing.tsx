import { motion, useScroll, useTransform } from "motion/react"; // use this import path instead of node_modules
import { useRef } from "react";

const BiggerFont = ({ word }: { word: string }): React.ReactNode => {
  return (
    <>
      {[...word].map((letter, index) => (
        <motion.span
          key={index}
          whileHover={{ scale: 2 }}
          transition={{ duration: 0.25 }}
          id="letter-gradient"
          style={{ display: "inline-block" }} // Needed for transform to work properly
          drag
          dragConstraints={{
            left: 50,
            right: 50,
          }}
          dragElastic={0.9}
          dragSnapToOrigin
          dragPropagation
        >
          {letter}
        </motion.span>
      ))}
    </>
  );
};

const Landing = (): React.ReactNode => {
  const containerRef = useRef<HTMLDivElement>(null),
    { scrollYProgress } = useScroll({
      target: containerRef,
      offset: ["start start", "end end"],
    }),
    opacity1 = useTransform(scrollYProgress, [0, 0.33], [1, 0]),
    opacity2 = useTransform(scrollYProgress, [0.33, 0.66], [0, 1]),
    opacity3 = useTransform(scrollYProgress, [0.66, 1], [0, 1]);

  return (
    <div id="Landing">
      <header>
        <div id="logotext">
          <BiggerFont word="Lynx" />
        </div>
        <p>Financial management made easy</p>
        <button>
          <i className="fa-solid fa-user-plus"></i>
        </button>
      </header>
      <nav id="side">
        <div id="highlighters">
          <div id="line"></div>
          <div id="dot"></div>
        </div>
        <div id="text">
          <button>Intro</button>
          <button>Features</button>
          <button>Sign up</button>
        </div>
      </nav>
      <div id="divider" />
      <div id="container">
        <div id="content" ref={containerRef}>
          <motion.div
            style={{
              opacity: opacity1,
              zIndex: 3,
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
            id="intro"
          >
            <h1>Lynx</h1>
            <p>Manage your finances with ease and smartness</p>
          </motion.div>
          <motion.div
            style={{
              opacity: opacity2,
              zIndex: 2,
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
            id="features"
          >
            <h1>Features</h1>
          </motion.div>
          <motion.div
            style={{
              opacity: opacity3,
              zIndex: 1,
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
            id="join"
          >
            <h1>Join in</h1>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
