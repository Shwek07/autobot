import AutoBot from "@/components/autobot/autobot"
import styles from "./autobotpage.module.css"
import Footer from "@/components/footer/footer"

export default function Agent(){
    return (
    <div className={styles.body}>
     <AutoBot />
     <Footer />
    </div>
    )
}