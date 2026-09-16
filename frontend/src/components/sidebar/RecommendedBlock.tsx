import "./RecommendedBlock.css";

function RecommendedBlock() {
  return (
    <div className="recommended-block">
      <p className="sidebar-label">Polecane</p>
      <h2>
        Wpisy, które
        <br />
        warto przeczytać.
      </h2>
      <ul>
        <li>Małe rytuały na dobry dzień.</li>
        <li>Jak zwolnić i odpocząć.</li>
        <li>Pomysły na idealny weekend.</li>
      </ul>
      <a className="text-link" href="#posts">
        zobacz więcej <span aria-hidden="true">↗</span>
      </a>
    </div>
  );
}

export default RecommendedBlock;
