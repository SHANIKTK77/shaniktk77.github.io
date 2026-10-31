// Global styles first so component styles can build on them
import "./styles/tokens.css";
import "./styles/base.css";
import resume from "./Assets/Resume.pdf";
import { profile, stats, games, experience, experienceIntro, education, skills } from "./data";
import useReveal from "./hooks/useReveal";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Work from "./components/Work";
import Experience from "./components/Experience";
import Skills from "./components/Skills";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

const RESUME_NAME = "Shadman-Khan-Khattak-Resume.pdf";

function App() {
  useReveal();

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header name={profile.name} />
      <main id="main" tabIndex="-1">
        <Hero
          profile={profile}
          stats={stats}
          games={games}
          resume={resume}
          resumeName={RESUME_NAME}
        />
        <Work games={games} />
        <Experience experience={experience} education={education} intro={experienceIntro} />
        <Skills skills={skills} />
        <Contact profile={profile} resume={resume} resumeName={RESUME_NAME} />
      </main>
      <Footer name={profile.name} />
    </>
  );
}

export default App;
