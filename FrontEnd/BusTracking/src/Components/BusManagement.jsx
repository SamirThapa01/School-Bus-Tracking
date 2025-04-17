import React from "react";
import DataTable from "./DataTable";
import { Plus } from "lucide-react";
import axios from "axios";
import CreateBus from "./CreateBus";

const BusManagement = ({
  buses,
  activeTab,
  setIsCreateBusVisible,
  isCreateBusVisible,
  setProfileMode,
  profileMode,
  setBusData,
  busData,
}) => {
  const busColumns = ["Bus ID", "Bus Number", "Capacity", "Driver"];

  return (
    <div className="management">
      <h2>Bus Management</h2>
      <button
        className="add-button"
        onClick={() => {
          setIsCreateBusVisible(true);
          setProfileMode("create");
        }}
      >
        <Plus /> Add Bus
      </button>
      {isCreateBusVisible && (
        <CreateBus
          setIsCreateBusVisible={setIsCreateBusVisible}
          profileMode={profileMode}
          busData={busData}
        />
      )}
      <DataTable
        columns={busColumns}
        rows={buses}
        activeTab={activeTab}
        setBusData={setBusData}
        setProfileMode={setProfileMode}
        setIsCreateBusVisible={setIsCreateBusVisible}
      />
    </div>
  );
};

export default BusManagement;
