"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export default function Home() {
  const demos = [
    { title: "Language Detector", description: "Identify 15+ languages from text input with 94% accuracy." },
    { title: "Anime Character Generator", description: "Create unique anime characters using AI." },
    { title: "AI Song Generator", description: "Generate short melodies and lyrics with a single prompt." },
    { title: "Voice Cloning (FR/EN)", description: "Clone a voice and speak any text in French or English." },
  ];

  const projects = [
    { title: "Image Captioning", description: "CNN + LSTM model that generates natural language descriptions for images.", tech: ["Python", "TensorFlow", "Keras"] },
    { title: "Customer Churn Prediction", description: "Predict customer attrition with 87% accuracy using XGBoost.", tech: ["Python", "XGBoost", "Scikit-learn"] },
    { title: "Language Detection API", description: "Fast, lightweight API for detecting 15+ languages from short text.", tech: ["Python", "FastAPI", "Docker"] },
  ];

  const techStack = ["Python", "TensorFlow", "PyTorch", "FastAPI", "React", "Next.js", "Docker", "Kubernetes"];

  return (
    <div>
      {/* Hero */}
      <section style={{ paddingTop: "6rem", paddingBottom: "3rem" }}>
        <div className="container">
          <div style={{ maxWidth: "64rem", margin: "0 auto" }}>
            {/* Title grid */}
            <h1 style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              color: 'var(--heading-primary)',
              textAlign: 'center',
              marginBottom: '1.5rem',
            }} className="md:text-5xl">
              AI on your terms
            </h1>

            <p style={{ fontSize: "1.25rem", color: "var(--text-caption)", marginBottom: "2rem", maxWidth: "42rem" }}>
              I help people and companies work smarter by building them personalized AI tools that fit their workflow and make them more productive.
            </p>

            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <button className="btn btn-primary">Explore demos</button>
              <button className="btn btn-secondary">See projects</button>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Carousel */}
      <section style={{ backgroundColor: "var(--bg-secondary)", padding: "3rem 0" }}>
        <div className="container">
          <h2 style={{ fontSize: "1.875rem", fontWeight: "bold", color: "var(--heading-primary)", marginBottom: "2rem" }}>Try the demos</h2>
          <div style={{ maxWidth: "64rem", margin: "0 auto" }}>
            <Swiper
              modules={[Pagination]}
              spaceBetween={24}
              slidesPerView={1}
              pagination={{ clickable: true }}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              style={{ paddingBottom: "3rem" }}
            >
              {demos.map((demo, idx) => (
                <SwiperSlide key={idx}>
                  <div className="card">
                    <h3>{demo.title}</h3>
                    <p>{demo.description}</p>
                    <button className="btn btn-secondary" style={{ marginTop: "0.5rem" }}>Try it</button>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section style={{ padding: "3rem 0" }}>
        <div className="container">
          <h2 style={{ fontSize: "1.875rem", fontWeight: "bold", color: "var(--heading-primary)", marginBottom: "2rem" }}>Featured projects</h2>
          <div className="grid-2">
            {projects.map((project, idx) => (
              <div key={idx} className="card">
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <div className="card-tech">
                  {project.tech.map((t, i) => (
                    <span key={i} className="tech-badge">{t}</span>
                  ))}
                </div>
                <a href="#" className="card-link">View project →</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section style={{ backgroundColor: "var(--bg-secondary)", padding: "3rem 0" }}>
        <div className="container">
          <h2 style={{ fontSize: "1.875rem", fontWeight: "bold", color: "var(--heading-primary)", marginBottom: "2rem" }}>Tech stack</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "flex-start" }}>
            {techStack.map((tech, idx) => (
              <span key={idx} className="chip">{tech}</span>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section style={{ padding: "3rem 0" }}>
        <div className="container">
          <div style={{ maxWidth: "48rem", margin: "0 auto" }}>
            <h2 style={{ fontSize: "1.875rem", fontWeight: "bold", color: "var(--heading-primary)", marginBottom: "1rem" }}>About me</h2>
            <p>
              I’m a freelance AI developer with a background in software engineering.
              I build custom AI tools — from RAG assistants to creative demos — that fit your workflow.
              My approach combines clean code with practical machine learning, delivering
              solutions that are secure, scalable, and actually useful.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>© 2025 Kevin Tchinda. Built with Next.js.</p>
          <div className="footer-links">
            <a href="mailto:kevin.tchinda@example.com">Email</a>
            <a href="https://github.com/kevin-tchinda" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="https://linkedin.com/in/kevinntchinda" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </div>
        </div>
      </footer>

      {/* Floating Action Button */}
      <button className="fab">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
      </button>
    </div>
  );
}