import AutoBot from "@/components/autobot/autobot"
import styles from "./autobotpage.module.css"
import Footer from "@/components/footer/footer"

export default function Agent(){
    return (
    <div className={styles.body}>
     <h1>TEST</h1>
     <AutoBot />
     <Footer />
    </div>
    )
}