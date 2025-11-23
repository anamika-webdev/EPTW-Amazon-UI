# EPTW - Electronic Permit-To-Work System

## 🎯 Project Overview

A comprehensive, enterprise-grade web-based Permit-To-Work (PTW) management system designed for industrial and telecom environments. The system supports three distinct user roles with different permissions and capabilities.

## 👥 User Roles

### 1. Administrator
**Full System Management & Oversight**
- Manage all sites, supervisors, and workers
- View and monitor all PTW permits across the organization
- Generate reports and statistics
- Complete CRUD operations on users and sites

### 2. Supervisor
**PTW Creation & Worker Management**
- Create and issue new PTW permits
- Manage assigned workers
- Fill comprehensive safety forms
- Upload SWMS documents
- Collect digital signatures
- Track permit status and approvals

### 3. Worker
**View & Acknowledge Assigned Permits**
- View assigned work permits
- Review safety requirements and hazards
- Complete safety checklists
- Provide digital signature acknowledgment
- Access work instructions and PPE requirements

## 🎨 Design Features

### Visual Design
- **Clean & Professional**: Modern UI with telecom/industrial aesthetic
- **Color-Coded Status System**:
  - 🟡 Yellow: Pending
  - 🟢 Green: Approved
  - 🔴 Red: Rejected
  - 🔵 Blue: In-Progress
  - ⚫ Gray: Completed
  - 🟠 Orange: Expired

### Layout
- **Left Sidebar Navigation**: Role-specific menu items
- **Top Header**: Search, notifications, and user profile
- **Responsive Design**: Works on desktop and mobile devices
- **Dashboard Cards**: Visual statistics and metrics
- **Data Tables**: Sortable and filterable permit lists

## 📋 Key Features by Role

### Admin Dashboard
1. **Home Dashboard**
   - Total sites, workers, supervisors statistics
   - PTW issued count
   - PTW by category pie chart
   - Recent permits table

2. **Site Management**
   - Add/Edit/Delete sites
   - Site status management
   - Location and area tracking

3. **User Management**
   - Manage supervisors and workers
   - Tabbed interface for user types
   - CRUD operations with modal dialogs
   - Site assignment

4. **All Permits View**
   - Comprehensive permit listing
   - Multi-filter functionality (Site, Status, Category, Date)
   - Detailed permit information
   - Status tracking

### Supervisor Dashboard
1. **Home Dashboard**
   - Worker count statistics
   - PTW issued/pending/completed metrics
   - Pending approval alerts
   - In-progress work tracking

2. **Worker List**
   - View all assigned workers
   - Worker contact information
   - Quick PTW assignment
   - Worker statistics

3. **Create PTW Form** (Multi-Step Process)
   - **Step 1: Basic Information**
     - Permit category selection
     - Site and location
     - Work description
     - Date and time scheduling
     - Issuer signature
   
   - **Step 2: Assign Workers**
     - Select workers from list
     - Multi-select capability
     - Worker profile preview
   
   - **Step 3: Hazards & Control Measures**
     - Hazard identification checklist
     - Control measures description
     - Safety procedure documentation
   
   - **Step 4: PPE & SWMS Upload**
     - Visual PPE selector (8 items)
     - SWMS file upload
     - Document management
   
   - **Step 5: Work Requirements**
     - General requirements checklist
     - Category-specific requirements:
       - Height work requirements
       - Electrical work requirements
       - Hot work requirements
       - Confined space requirements
     - YES/NO/NA selection system
   
   - **Step 6: Review & Submit**
     - Summary of all information
     - Required approvals section
     - Multiple signature collection
     - Declaration checkbox
     - Final submission

4. **PTW Details View**
   - Complete permit information
   - All signatures and approvals
   - Download PDF capability
   - Edit functionality

### Worker Dashboard
1. **Home Dashboard**
   - Assigned PTWs count
   - Pending signatures alert
   - Completed PTWs tracking
   - Priority notifications

2. **PTW Details View**
   - Work details and description
   - Hazard warnings (highlighted)
   - Safety control measures
   - Visual PPE requirements
   - Team member information
   - Safety acknowledgment checklist:
     - Safety briefing confirmation
     - Hazards understood
     - Control measures understood
     - PPE availability
     - Emergency procedures knowledge
   - Digital signature capability

## 🛠 Technical Components

### Shared Components
- **StatCard**: Dashboard statistics cards
- **StatusBadge**: Color-coded status indicators
- **DigitalSignature**: Canvas-based signature capture
- **PPESelector**: Visual PPE selection grid
- **OnScreenKeyboard**: Virtual keyboard for field input

### Admin Components
- AdminDashboard
- SiteManagement
- UserManagement
- PTWAllPermits

### Supervisor Components
- SupervisorDashboard
- WorkerList
- CreatePTW (Multi-step form)
- SupervisorPTWDetails

### Worker Components
- WorkerDashboard
- WorkerPTWDetails

### Layout Components
- Sidebar (Role-based navigation)
- Header (Search, notifications, profile)

## 📊 PTW Categories

1. **General Work**
2. **Work at Height**
3. **Electrical Work**
4. **Hot Work** (Welding, Cutting)
5. **Confined Space**

Each category has specific safety requirements and checklists.

## 🔐 Safety Features

### Digital Signatures
- Canvas-based signature capture
- Multiple signature types:
  - Issuer signature
  - Area in-charge approval
  - Safety in-charge approval
  - Site leader approval
  - Worker acknowledgment

### Safety Checklists
- Pre-work safety verification
- Category-specific requirements
- YES/NO/NA response system
- Mandatory completion before work

### PPE Management
Visual selection of 8 PPE items:
- ⛑️ Safety Helmet
- 🦺 Safety Vest
- 🧤 Safety Gloves
- 🥾 Safety Boots
- 🥽 Safety Glasses
- 😷 Face Mask
- 🎧 Ear Protection
- 🪢 Safety Harness

### Document Management
- SWMS file upload
- PDF export capability
- Document version tracking

## 📱 User Experience Features

### Navigation
- Role-specific sidebar menus
- Breadcrumb navigation
- Quick action buttons
- Context-aware actions

### Visual Feedback
- Color-coded status badges
- Progress indicators
- Loading states
- Success/error notifications
- Hover effects and transitions

### Accessibility
- Clear typography hierarchy
- High contrast design
- Touch-friendly buttons
- Keyboard navigation support
- Screen reader compatible

## 🔄 Workflow

### Typical PTW Workflow:
1. **Supervisor creates PTW**
   - Fills out multi-step form
   - Assigns workers
   - Identifies hazards
   - Specifies control measures
   - Uploads SWMS document

2. **Approvals collected**
   - Area in-charge signature
   - Safety in-charge signature
   - Site leader signature

3. **Worker acknowledgment**
   - Reviews permit details
   - Reads hazards and controls
   - Completes safety checklist
   - Provides digital signature

4. **Work execution**
   - PTW status: In-Progress
   - Workers follow safety procedures
   - PPE requirements enforced

5. **Work completion**
   - Final sign-off
   - PTW status: Completed
   - Document archival

## 🎯 Data Management

### Mock Data Included
- 4 Sites (Alpha, Beta, Gamma, Delta)
- 3 Supervisors
- 6 Workers
- 5 Sample PTWs (various categories and statuses)

### Filters Available
- Site filter
- Status filter
- Category filter
- Date range filter
- Supervisor filter

## 🚀 Future Enhancements (Suggested)

1. **Real-time notifications**
2. **Mobile app integration**
3. **QR code scanning**
4. **Analytics dashboard**
5. **Audit trail logging**
6. **Integration with existing systems**
7. **Offline mode support**
8. **Multi-language support**
9. **Advanced reporting**
10. **Permit extension workflow**

## 📐 Technical Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS v4
- **Components**: Shadcn/UI
- **Icons**: Lucide React
- **Charts**: Recharts
- **State Management**: React useState/hooks

## 🎨 Design System

### Colors
- **Primary**: Blue (#3b82f6) - Admin
- **Success**: Green (#10b981) - Approved/Supervisor
- **Warning**: Orange (#f59e0b) - Pending/Worker
- **Danger**: Red (#ef4444) - Rejected
- **Info**: Purple (#8b5cf6) - Stats
- **Neutral**: Slate - Base UI

### Typography
- Clean, professional font hierarchy
- Consistent spacing and sizing
- Readable on all devices

### Components
- Rounded corners (0.625rem radius)
- Subtle shadows and borders
- Smooth transitions
- Hover states on interactive elements

## 📝 Notes

This is a fully functional demo/prototype with:
- ✅ Complete UI for all three user roles
- ✅ Multi-step form implementation
- ✅ Digital signature capability
- ✅ File upload interface
- ✅ Comprehensive safety checklists
- ✅ Visual PPE selection
- ✅ Status management
- ✅ Responsive design

**Note**: This is a frontend prototype using mock data. For production use, backend integration would be required for:
- User authentication
- Database storage
- File management
- Real-time updates
- Email notifications
- Report generation
