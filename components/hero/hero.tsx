import styles from "./hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.overlay} />
      <div className={styles.content}>
        <div className={styles.logo}>
          <span className={styles.logoMain}># CARPARTS</span>
          <span className={styles.logoExpert}>EXPERT</span>
        </div>
        
        <h1>Vind onderdelen voor jouw auto in seconden</h1>
        <p>Selecteer je auto om de juiste onderdelen te vinden</p>

        <div className={styles.searchBox}>
          <select className={styles.select}>
            <option>Merk</option>
            <option>Toyota</option>
            <option>Nissan</option>
            <option>Ford</option>
            <option>Mazda</option>
            <option>Lexus</option>
            <option>Tesla</option>
            <option>Audi</option>
            <option>Mitsubishi</option>
            <option>Subaru</option>
            <option>Kia</option>
            <option>BMW</option>
            <option>Mercedes-Benz</option>
            <option>Porsche</option>
            <option>Jaguar</option>
            <option>Bentley</option>
            <option>Rolls-Royce</option>  
          </select>

          <select className={styles.select}>
            <option>Model</option>
            <option>Camry</option>
            <option>Corolla</option>
            <option>Qashqai</option>
            <option>A4</option>
            <option>3 Series</option>
            <option>C-Class</option>
          </select>

          <select className={styles.select}>
            <option>Bouwjaar</option>
               <option>2026</option>
                <option>2025</option>
                <option>2024</option>
                <option>2023</option>
                <option>2022</option>
                <option>2021</option>
                <option>2020</option>
                <option>2019</option>
                <option>2018</option>
                <option>2017</option>
                <option>2016</option>
                <option>2015</option>
                <option>2014</option>
                <option>2013</option>
                <option>2012</option>
                <option>2011</option>
                <option>2010</option>
                <option>2009</option>
                <option>2008</option>
                <option>2007</option>
                <option>2006</option>
                <option>2005</option>
                <option>2004</option>
                <option>2003</option>
                <option>2002</option>
                <option>2001</option>
                <option>2000</option>
          </select>

          <button className={styles.searchButton}>Zoek onderdelen</button>
        </div>
      </div>
    </section>
  );
}