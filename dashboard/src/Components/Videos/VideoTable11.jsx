import React from 'react';
import './DataTable.css'; // Import your CSS file for styling

const DataTable = () => {
  return (
    <div className="data-table-container">
      <div className="data-table">
        <div className="data-table-header">
          <div className="header-cell">
            <input type="checkbox" className="checkbox" />
          </div>
          <div className="header-cell">Serving Company</div>
          <div className="header-cell">Status</div>
          <div className="header-cell">Invoice Number</div>
          <div className="header-cell">Client Company</div>
          <div className="header-cell">Total Amount</div>
          <div className="header-cell">Payment Status</div>
          <div className="header-cell">Invoice Date</div>
          <div className="header-cell">Created At</div>
          <div className="header-cell">Created By</div>
          <div className="header-cell">Client</div>
          <div className="header-cell">Action*</div>
        </div>

        <div className="data-table-body">
          <div className="data-row">
            <div className="cell">
              <input type="checkbox" className="checkbox" />
            </div>
            <div className="cell">Car Connect</div>
            <div className="cell">
              <div className="status-indicator gray" /> Created
            </div>
            <div className="cell">CC/24-25/007</div>
            <div className="cell"></div>
            <div className="cell">11385.00</div>
            <div className="cell">
              <div className="status-indicator gray" /> Unpaid
            </div>
            <div className="cell">
              <strong>29-08-2024</strong>
            </div>
            <div className="cell">30-Aug 12:50</div>
            <div className="cell">Alex</div>
            <div className="cell">
              <div className="client-indicator red" /> Walk In (Kriti)
            </div>
            <div className="cell">
              <i className="bx bx-dots-horizontal-rounded action-icon" />
              <i className="uil uil-pen action-icon" />
            </div>
          </div>

          {/* Repeat for more rows as needed */}
        </div>
      </div>
    </div>
  );
};

export default DataTable;
