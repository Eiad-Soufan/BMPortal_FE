export const sections = [
  { id: 1, name: "الموارد البشرية", engName: "Human Resources" },
  { id: 2, name: "المالية", engName: "Finance" },
  { id: 3, name: "التسويق", engName: "Marketing" },
  { id: 4, name: "المشتريات", engName: "Procurement" },
  { id: 5, name: "الخدمات اللوجستية", engName: "Logistics" },
  { id: 6, name: "المخازن", engName: "Warehouse" },
  { id: 7, name: "خدمة العملاء", engName: "Customer Service" },
  { id: 8, name: "القانونية", engName: "Legal" },
  { id: 9, name: "نظم المعلومات", engName: "IT" },
  { id: 10, name: "الإدارة العليا", engName: "Top Management" },
  { id: 11, name: "الصيانة", engName: "Maintenance" },
];

export const forms = [
  {
    id: "HR-001",
    sectionId: 1,
    category: "إجازات",
    nameAr: "طلب إجازة سنوية",
    nameEn: "Annual Leave Request",
    description: "نموذج لتقديم طلب إجازة سنوية"
  },
  {
    id: "HR-002",
    sectionId: 1,
    category: "دوام",
    nameAr: "نموذج تعديل دوام",
    nameEn: "Work Hours Adjustment",
    description: "نموذج لتعديل مواعيد الدوام"
  },
  {
    id: "FIN-001",
    sectionId: 2,
    category: "مالية",
    nameAr: "طلب سلفة مالية",
    nameEn: "Advance Payment Request",
    description: "نموذج طلب صرف سلفة"
  },
  {
    id: "CS-001",
    sectionId: 7,
    category: "شكاوى",
    nameAr: "نموذج شكوى عميل",
    nameEn: "Customer Complaint Form",
    description: "تسجيل شكوى من عميل"
  },
  {
    id: "IT-001",
    sectionId: 9,
    category: "نظام",
    nameAr: "طلب دعم تقني",
    nameEn: "IT Support Request",
    description: "طلب دعم فني للنظام"
  },
  // يمكنك إضافة المزيد من النماذج لاحقًا حسب الحاجة
];
