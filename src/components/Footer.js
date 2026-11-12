import "./Footer.css";

export default function Footer({ name }) {
  return (
    <footer className="site-footer">
      <div className="container">
        {/* The name set as wide as the page, like a closing title card */}
        <p className="site-footer__name" aria-hidden="true">
          {name}
        </p>
        <div className="site-footer__bar">
          <p>
            © {new Date().getFullYear()} {name}
          </p>
          <p className="site-footer__build">Built with React and a hand-written WebGL shader</p>
          <nav aria-label="Footer">
            <a href="/privacy-policy">Privacy policy</a>
            <a href="/terms-of-service">Terms of service</a>
            <a href="#top">Back to top</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
