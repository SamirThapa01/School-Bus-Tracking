import React from "react";
import { Users, Bus, UserPlus, Briefcase } from "lucide-react";


const styles = {
  dashboardContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "50px",
    padding: "20px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    overflow: "hidden",
    position: "relative",
  },
  cardHover: {
    transform: "translateY(-5px)",
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "16px",
  },
  cardTitle: {
    fontSize: "15px",
    color: "#6B7280",
    margin: "0",
    fontWeight: "500",
  },
  cardIconWrapper: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cardValue: {
    fontSize: "28px",
    fontWeight: "700",
    margin: "0",
    color: "#111827",
  },
  cardFooter: {
    display: "flex",
    alignItems: "center",
    marginTop: "16px",
    fontSize: "14px",
  },
  cardTrend: {
    display: "flex",
    alignItems: "center",
    fontWeight: "500",
  },
  cardDetail: {
    marginLeft: "auto",
    color: "#6B7280",
    fontSize: "13px",
  },
  // Card color variants
  studentCard: {
    iconBg: "#EEF2FF",
    iconColor: "#4F46E5",
    trendColor: "#10B981",
  },
  busCard: {
    iconBg: "#FEF3C7",
    iconColor: "#D97706",
    trendColor: "#F59E0B",
  },
  parentCard: {
    iconBg: "#ECFDF5",
    iconColor: "#059669",
    trendColor: "#10B981",
  },
  progressBar: {
    height: "4px",
    width: "100%",
    backgroundColor: "#F3F4F6",
    borderRadius: "2px",
    marginTop: "12px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: "2px",
  },
};

const Card = ({ title, value, icon, color, percentage, lastUpdated }) => {
  const [hover, setHover] = React.useState(false);

  return (
    <div
      style={{
        ...styles.card,
        ...(hover ? styles.cardHover : {}),
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={styles.cardHeader}>
        <h3 style={styles.cardTitle}>{title}</h3>
        <div
          style={{
            ...styles.cardIconWrapper,
            backgroundColor: color.iconBg,
          }}
        >
          {icon}
        </div>
      </div>
      <h2 style={styles.cardValue}>{value}</h2>

      <div style={styles.progressBar}>
        <div
          style={{
            ...styles.progressFill,
            width: `${percentage}%`,
            backgroundColor: color.iconColor,
          }}
        ></div>
      </div>

      <div style={styles.cardFooter}>
        <span
          style={{
            ...styles.cardTrend,
            color: color.trendColor,
          }}
        >
          {/* Trend icon/text could go here */}
        </span>
        <span style={styles.cardDetail}>
          {lastUpdated ? `Last updated: ${lastUpdated}` : "Up to date"}
        </span>
      </div>
    </div>
  );
};

const Dashboard = ({ students, buses, parents, others }) => {
  
  const total = students.length + buses.length + parents.length;
  const studentsPercentage = total > 0 ? (students.length / total) * 100 : 25;
  const busesPercentage = total > 0 ? (buses.length / total) * 100 : 25;
  const parentsPercentage = total > 0 ? (parents.length / total) * 100 : 25;


  return (
    <div style={styles.dashboardContainer}>
      <Card
        title="TOTAL STUDENTS"
        value={students.length}
        icon={<Users size={24} color={styles.studentCard.iconColor} />}
        color={styles.studentCard}
        percentage={studentsPercentage}
      />
      <Card
        title="TOTAL BUSES"
        value={buses.length}
        icon={<Bus size={24} color={styles.busCard.iconColor} />}
        color={styles.busCard}
        percentage={busesPercentage}
      />
      <Card
        title="TOTAL PARENTS"
        value={parents.length}
        icon={<UserPlus size={24} color={styles.parentCard.iconColor} />}
        color={styles.parentCard}
        percentage={parentsPercentage}
      />
    </div>
  );
};

export default Dashboard;
