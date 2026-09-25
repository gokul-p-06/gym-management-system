import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Portfolio.css";

function Portfolio() {
  const navigate = useNavigate();

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const viewportHeight = window.innerHeight;

          const heroPhoto = document.querySelector(
            ".portfolio-hero-photo"
          );

          const heroBackground = document.querySelector(
            ".portfolio-hero-bg"
          );

          const heroCopy = document.querySelector(
            ".hero-copy"
          );

          const photoCaption = document.querySelector(
            ".photo-caption"
          );

          const scrollIndicator = document.querySelector(
            ".hero-scroll-indicator"
          );

          if (heroPhoto) {
            const photoTranslate = scrollY * 0.18;

            const photoScale =
              1 + scrollY * 0.00012;

            const photoOpacity = Math.max(
              0.18,
              1 -
                scrollY /
                  (viewportHeight * 1.15)
            );

            heroPhoto.style.transform =
              `translate3d(0, ${photoTranslate}px, 0) scale(${photoScale})`;

            heroPhoto.style.opacity =
              photoOpacity;
          }

          if (heroBackground) {
            const backgroundTranslate =
              scrollY * 0.08;

            const backgroundScale =
              1 + scrollY * 0.00008;

            heroBackground.style.transform =
              `translate3d(0, ${backgroundTranslate}px, 0) scale(${backgroundScale})`;
          }

          if (heroCopy) {
            const copyOpacity = Math.max(
              0,
              1 -
                scrollY /
                  (viewportHeight * 0.65)
            );

            const copyTranslate = Math.min(
              scrollY * -0.08,
              -45
            );

            heroCopy.style.transform =
              `translate3d(0, ${copyTranslate}px, 0)`;

            heroCopy.style.opacity =
              copyOpacity;
          }

          if (photoCaption) {
            photoCaption.style.opacity =
              Math.max(
                0,
                1 -
                  scrollY /
                    (viewportHeight * 0.55)
              );
          }

          if (scrollIndicator) {
            scrollIndicator.style.opacity =
              Math.max(
                0,
                0.5 -
                  scrollY /
                    (viewportHeight * 0.45)
              );
          }

          const sections =
            document.querySelectorAll(
              ".portfolio-section, " +
                ".portfolio-philosophy, " +
                ".portfolio-contact, " +
                ".portfolio-final"
            );

          sections.forEach((section) => {
            const rect =
              section.getBoundingClientRect();

            if (
              rect.top <
                viewportHeight * 0.88 &&
              rect.bottom > 0
            ) {
              section.classList.add(
                "section-visible"
              );
            }
          });

          ticking = false;
        });

        ticking = true;
      }
    };

    handleScroll();

    window.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );

    window.addEventListener(
      "resize",
      handleScroll
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );

      window.removeEventListener(
        "resize",
        handleScroll
      );
    };
  }, []);

  const scrollToAbout = () => {
    document
      .getElementById("about")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  return (
    <div className="portfolio-page">

      {/* =========================
          HERO
      ========================= */}

      <section className="portfolio-hero">

        <div className="portfolio-hero-bg">
          <div className="hero-bg-overlay"></div>
        </div>

        <div className="portfolio-hero-content">

          <div className="hero-copy">

            <span className="hero-eyebrow">
              KARUNA KARAN • FITNESS PROFESSIONAL
            </span>

            <h1>
              Building Strength.
              <br />
              <span>
                Building People.
              </span>
            </h1>

            <p>
              A dedicated fitness professional
              focused on building a stronger,
              healthier and more disciplined
              community.
            </p>

            <div className="hero-actions">

              <button
                onClick={scrollToAbout}
              >
                Explore Achievements
                <span>↓</span>
              </button>

              <button
                className="hero-back-button"
                onClick={() =>
                  navigate("/dashboard")
                }
              >
                Enter Management
              </button>

            </div>

          </div>

          {/* =========================
              KARUNA KARAN PHOTO
          ========================= */}

          <div className="portfolio-photo-wrapper">

            <div className="photo-glow"></div>

            <div className="portfolio-hero-photo">

              <img
                src="/ashwath.webp"
                alt="KARUNA KARAN"
              />

            </div>

            <div className="photo-caption">

              <span>
                KARUNA KARAN
              </span>

              <strong>
                Leadership & Fitness
              </strong>

            </div>

          </div>

        </div>

        <div className="hero-scroll-indicator">

          <span>
            SCROLL TO EXPLORE
          </span>

          <div className="scroll-line"></div>

        </div>

      </section>

      {/* =========================
          ABOUT
      ========================= */}

      <section
        id="about"
        className="portfolio-section about-section"
      >

        <div className="section-number">
          01
        </div>

        <div className="section-heading">

          <span>
            ABOUT THE KARUNA KARAN
          </span>

          <h2>
            More than a gym.
            <br />
            <em>
              A community.
            </em>
          </h2>

        </div>

        <div className="about-content">

          <p className="about-large">
            Fitness is not just about lifting
            weights. It's about discipline,
            consistency and becoming a better
            version of yourself.
          </p>

          <p>
            With years of experience in the
            fitness industry, our gym owner
            has dedicated his journey to
            helping people build confidence,
            strength and healthier lifestyles.
          </p>

        </div>

      </section>

      {/* =========================
          EXPERIENCE
      ========================= */}

      <section className="portfolio-section experience-section">

        <div className="section-number">
          02
        </div>

        <div className="section-heading">

          <span>
            EXPERIENCE
          </span>

          <h2>
            Years of
            <br />
            <em>
              dedication.
            </em>
          </h2>

        </div>

        <div className="experience-grid">

          <div className="experience-card">

            <strong>
              10+
            </strong>

            <span>
              Years Experience
            </span>

            <p>
              Fitness industry experience
              and continuous learning.
            </p>

          </div>

          <div className="experience-card">

            <strong>
              1000+
            </strong>

            <span>
              Members Guided
            </span>

            <p>
              Helping members achieve
              their fitness goals.
            </p>

          </div>

          <div className="experience-card">

            <strong>
              5+
            </strong>

            <span>
              Fitness Disciplines
            </span>

            <p>
              Strength, conditioning,
              nutrition and more.
            </p>

          </div>

        </div>

      </section>

      {/* =========================
          CERTIFICATIONS
      ========================= */}

      <section className="portfolio-section certification-section">

        <div className="section-number">
          03
        </div>

        <div className="section-heading">

          <span>
            CERTIFICATIONS
          </span>

          <h2>
            Knowledge behind
            <br />
            <em>
              every rep.
            </em>
          </h2>

        </div>

        <div className="certification-list">

          <div className="certification-item">

            <span>
              01
            </span>

            <div>

              <h3>
                Certified Fitness Professional
              </h3>

              <p>
                Professional fitness training
                and exercise science.
              </p>

            </div>

            <b>
              →
            </b>

          </div>

          <div className="certification-item">

            <span>
              02
            </span>

            <div>

              <h3>
                Strength & Conditioning
              </h3>

              <p>
                Strength development and
                performance training.
              </p>

            </div>

            <b>
              →
            </b>

          </div>

          <div className="certification-item">

            <span>
              03
            </span>

            <div>

              <h3>
                Nutrition & Wellness
              </h3>

              <p>
                Healthy lifestyle and
                nutrition guidance.
              </p>

            </div>

            <b>
              →
            </b>

          </div>

        </div>

      </section>

      {/* =========================
          PHILOSOPHY
      ========================= */}

      <section className="portfolio-philosophy">

        <div className="philosophy-overlay"></div>

        <div className="philosophy-content">

          <span>
            FITNESS PHILOSOPHY
          </span>

          <h2>
            “Discipline creates
            <br />
            <em>
              results.
            </em>
            ”
          </h2>

          <p>
            The goal is not simply to make
            people stronger in the gym.
            The goal is to help them become
            stronger in life.
          </p>

        </div>

      </section>

      {/* =========================
          CONTACT / SOCIAL
      ========================= */}

      <section className="portfolio-contact">

        <div className="contact-content">

          <span>
            CONNECT
          </span>

          <h2>
            Let's stay
            <br />
            <em>
              connected.
            </em>
          </h2>

          <p>
            Follow the journey, training,
            competitions and the gym community.
          </p>

          <div className="contact-links">

            {/* INSTAGRAM */}

            <a
              href="https://www.instagram.com/team_muscle.formula/"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-link"
              aria-label="Open Team Muscle Formula Instagram"
            >

              <div className="contact-link-icon instagram-icon">

                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >

                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />

                  <circle
                    cx="12"
                    cy="12"
                    r="4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />

                  <circle
                    cx="17.3"
                    cy="6.7"
                    r="1"
                    fill="currentColor"
                  />

                </svg>

              </div>

              <div className="contact-link-content">

                <span>
                  INSTAGRAM
                </span>

                <strong>
                  @team_muscle.formula
                </strong>

              </div>

              <div className="contact-link-arrow">
                ↗
              </div>

            </a>

            {/* PHONE */}

            <a
              href="tel:+919944212723"
              className="contact-link"
              aria-label="Call Team Muscle Formula"
            >

              <div className="contact-link-icon phone-icon">

                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >

                  <path
                    d="M6.6 3.5L9.1 3C9.7 2.9 10.3 3.2 10.5 3.8L11.7 7C11.9 7.5 11.7 8.1 11.3 8.4L9.7 9.7C10.7 11.8 12.2 13.3 14.3 14.3L15.6 12.7C15.9 12.3 16.5 12.1 17 12.3L20.2 13.5C20.8 13.7 21.1 14.3 21 14.9L20.5 17.4C20.3 18.4 19.4 19.1 18.4 19C10.7 18.3 5.7 13.3 5 5.6C4.9 4.6 5.6 3.7 6.6 3.5Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                </svg>

              </div>

              <div className="contact-link-content">

                <span>
                  CONTACT
                </span>

                <strong>
                  +91 99442 12723
                </strong>

              </div>

              <div className="contact-link-arrow">
                ↗
              </div>

            </a>

          </div>

        </div>

      </section>

      {/* =========================
          FINAL CTA
      ========================= */}

      <section className="portfolio-final">

        <span>
          THE GYM COMMUNITY
        </span>

        <h2>
          Stronger
          <br />
          <em>
            together.
          </em>
        </h2>

        <p>
          A place to train hard,
          stay disciplined and
          become better every day.
        </p>

        <button
          onClick={() =>
            navigate("/dashboard")
          }
        >
          Enter Team Muscle Formula
          <span>
            →
          </span>
        </button>

      </section>

    </div>
  );
}

export default Portfolio;