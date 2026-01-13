import styles from './Badge.module.css'

function Badge({ children, variant = 'default', size = 'default' }) {
  return (
    <span className={`${styles.badge} ${styles[variant]} ${styles[size]}`}>
      {children}
    </span>
  )
}

export default Badge