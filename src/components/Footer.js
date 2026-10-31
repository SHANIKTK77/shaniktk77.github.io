import "./Footer.css";

export default function Footer({ name }) {
  return (
    <footer className="site-footer">
      <div className="container site-footer__bar">
        <p>
          © {new Date().getFullYear()} {name}
        </p>
        <nav aria-label="Footer">
          <a href="/privacy-policy">Privacy policy</a>
          <a href="#top">Back to top</a>
        </nav>
      </div>
    </footer>
  );
}
