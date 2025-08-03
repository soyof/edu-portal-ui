// API服务基础配置

// 公告类型定义
export interface Announcement {
  id: number;
  title: string;
  content: string;
  date: string;
  type: 'info' | 'warning' | 'important'; // 公告类型：普通、警告、重要
  isNew?: boolean;
  link?: string; // 可选的链接
}

// 模拟获取公告列表
export const getAnnouncements = (): Promise<Announcement[]> => {
  // 模拟异步请求
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          title: '2024年度研究生招生工作启动',
          content: '2024年度研究生招生工作现已启动，有意向的同学请于9月30日前提交申请材料。',
          date: '2023-08-15',
          type: 'important',
          isNew: true
        },
        {
          id: 2,
          title: '实验室设备检修通知',
          content: '本周五(8月18日)将进行实验室设备年度检修，请各位研究人员提前安排工作。',
          date: '2023-08-14',
          type: 'warning'
        },
        {
          id: 3,
          title: '学术报告：合成生物学前沿进展',
          content: '麻省理工学院张教授将于下周三(8月23日)来访并做学术报告，欢迎参加。',
          date: '2023-08-10',
          type: 'info',
          link: '/news'
        }
      ])
    }, 300)
  })
}
