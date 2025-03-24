// import React from 'react';
// import { LocalService } from '../../models/service/serviceModel';

// interface SideBarItemProps {
//   service: LocalService;
//   isSelected?: boolean;
//   onClick?: () => void;
// }

// export const SideBarItem: React.FC<SideBarItemProps> = ({ 
//   service, 
//   isSelected = false, 
//   onClick 
// }) => {
//   // Determine status color based on service status
//   const getStatusColor = () => {
//     switch (service.status) {
//       case 'running':
//         return 'bg-green-500';
//       case 'error':
//         return 'bg-red-500';
//       case 'stopped':
//       default:
//         return 'bg-gray-500';
//     }
//   };

//   return (
//     <div 
//       className={`p-3 mb-2 rounded-md cursor-pointer transition-all duration-200 ${
//         isSelected ? 'bg-gray-600' : 'bg-gray-700 hover:bg-gray-600'
//       }`}
//       onClick={onClick}
//     >
//       <div className="flex items-center justify-between">
//         <div className="font-medium text-white">{service.serviceName}</div>
//         <div className="flex items-center">
//           <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor()}`}></div>
//           <span className="text-xs text-gray-300">
//             {service.status || 'unknown'}
//           </span>
//         </div>
//       </div>
//       <div className="text-xs text-gray-400 mt-1">
//         Port: {service.port}
//       </div>
//     </div>
//   );
// };

// export default SideBarItem;
