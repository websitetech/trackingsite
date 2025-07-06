

interface ActionButtonsProps {
  onEstimate: () => void;
  onShip: () => void;
  onNewCustomer: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onEstimate, onShip, onNewCustomer }) => {
  return (
    <div className="action-buttons">
      <div className="action-buttons-container">
        <button className="action-btn estimate-btn" onClick={onEstimate}>
          <div className="btn-icon">💳</div>
          <div className="btn-content">
            <h3>Estimate Cost</h3>
            <p>Get instant shipping cost estimates</p>
          </div>
        </button>

        <button className="action-btn ship-btn" onClick={onShip}>
          <div className="btn-icon">🚚</div>
          <div className="btn-content">
            <h3>Ship Now</h3>
            <p>Create a new shipment</p>
          </div>
        </button>

        <button className="action-btn customer-btn" onClick={onNewCustomer}>
          <div className="btn-icon">👨‍💼</div>
          <div className="btn-content">
            <h3>New Customer</h3>
            <p>Register a new customer</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default ActionButtons; 