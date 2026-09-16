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
      <ul className="recommended-list">
        <li><a href="#rytualy">Małe rytuały na dobry dzień.</a></li>
        <li><a href="#odpoczynek">Jak zwolnić i odpocząć.</a></li>
        <li><a href="#weekend">Pomysły na idealny weekend.</a></li>
      </ul>
      <a className="text-link" href="#posts">
        zobacz więcej <span aria-hidden="true">↗</span>
      </a>
    </div>
  );
}

export default RecommendedBlock;
