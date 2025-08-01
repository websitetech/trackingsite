import React from 'react';

interface CustomPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  orderInfo?: any;
  width?: string;
  renderContent?: () => React.ReactNode;
}

const CustomPopup: React.FC<CustomPopupProps> = ({
  isOpen,
  onClose,
  title,
  message,
  orderInfo,
  width = '400px',
  renderContent
}) => {
  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)'
      }}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          width: width,
          maxHeight: '90vh',
          animation: 'modalSlideIn 0.3s ease-out',
          border: '1px solid #e5e7eb',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div 
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#f8fafc'
          }}
        >
          <h2 
            style={{ 
              color: '#1f2937',
              fontSize: '20px',
              fontWeight: 'bold',
              margin: 0
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              color: '#9ca3af',
              fontSize: '24px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              position: 'absolute',
              right: '16px',
              top: '16px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = '#6b7280';
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = '#9ca3af';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ×
          </button>
        </div>

        {/* Modal Body */}
        <div 
          style={{ 
            padding: '16px 24px',
            overflowY: 'auto',
            maxHeight: 'calc(90vh - 80px)'
          }}
        >
          {renderContent ? renderContent() : (
            <>
              {message && (
                <p 
                  style={{ 
                    color: '#6b7280',
                    fontSize: '14px',
                    marginBottom: '12px',
                    margin: '0 0 12px 0'
                  }}
                >
                  {message}
                </p>
              )}
              
              {orderInfo && (
                <div 
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #e5e7eb'
                  }}
                >
                  {orderInfo.trackingNumber && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#374151'
                      }}>
                        Tracking Number:
                      </span>
                      <span style={{
                        fontSize: '12px',
                        fontFamily: 'monospace',
                        fontWeight: 'bold',
                        color: '#1f2937'
                      }}>
                        {orderInfo.trackingNumber}
                      </span>
                    </div>
                  )}
                  {orderInfo.customer && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#374151'
                      }}>
                        Customer:
                      </span>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#1f2937'
                      }}>
                        {orderInfo.customer}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomPopup; 