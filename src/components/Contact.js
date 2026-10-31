import { useEffect, useRef, useState } from "react";
import { section } from "../sections";
import useLocalTime from "../hooks/useLocalTime";
import Icon from "./Icon";
import "./Contact.css";

const { index, label } = section("contact");

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  // Hidden where the Clipboard API isn't available; the address is a mailto link anyway
  if (typeof navigator === "undefined" || !navigator.clipboard) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button type="button" className="button copy" onClick={copy}>
      <Icon name={copied ? "check" : "copy"} />
      <span aria-live="polite">{copied ? "Copied" : "Copy address"}</span>
    </button>
  );
}

export default function Contact({ profile, resume, resumeName }) {
  const time = useLocalTime(profile.timeZone);

  return (
    <section className="section contact" id="contact" aria-labelledby="contact-title">
      <div className="container">
        <p className="contact__index label" data-reveal>
          <span>{index}</span> {label}
        </p>
        <h2 id="contact-title" className="contact__title" data-reveal>
          Get in touch
        </h2>
        <p className="contact__lede" data-reveal>
          {profile.availability} Email is the quickest way to reach me.
        </p>

        <div className="contact__email" data-reveal>
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
          <CopyButton text={profile.email} />
        </div>

        <dl className="contact__grid" data-reveal>
          <div>
            <dt className="label">Phone</dt>
            <dd>
              <a href={`tel:${profile.phone.replace(/\s/g, "")}`}>{profile.phone}</a>
            </dd>
          </div>
          <div>
            <dt className="label">Elsewhere</dt>
            <dd className="contact__links">
              <a href={profile.linkedin} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
              <a href={profile.github} target="_blank" rel="noreferrer">
                GitHub
              </a>
            </dd>
          </div>
          <div>
            <dt className="label">Resume</dt>
            <dd>
              <a href={resume} download={resumeName}>
                Download my resume (PDF)
              </a>
            </dd>
          </div>
          <div>
            <dt className="label">Local time</dt>
            <dd className="contact__time">
              {time ? `${time} in ${profile.location.split(",")[0]}` : profile.location} (
              {profile.utcOffset})
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
