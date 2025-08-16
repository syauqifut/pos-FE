import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  TrendingUp
} from 'lucide-react'

const DashboardPage = () => {
  const stats = [
    {
      title: 'Today\'s Sales',
      value: '$2,450',
      change: '+12%',
      changeType: 'positive' as const,
      icon: DollarSign
    },
    {
      title: 'Orders',
      value: '45',
      change: '+8%',
      changeType: 'positive' as const,
      icon: ShoppingBag
    },
    {
      title: 'Customers',
      value: '32',
      change: '+15%',
      changeType: 'positive' as const,
      icon: Users
    },
    {
      title: 'Revenue Growth',
      value: '23%',
      change: '+4%',
      changeType: 'positive' as const,
      icon: TrendingUp
    }
  ]

  const recentTransactions = [
    { id: '001', customer: 'John Doe', amount: '$45.99', time: '2 min ago', status: 'completed' },
    { id: '002', customer: 'Jane Smith', amount: '$127.50', time: '5 min ago', status: 'completed' },
    { id: '003', customer: 'Mike Johnson', amount: '$89.75', time: '12 min ago', status: 'pending' },
    { id: '004', customer: 'Sarah Wilson', amount: '$201.25', time: '18 min ago', status: 'completed' },
  ]

  return (
    <div className="p-3 space-y-4">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="mt-3 flex items-center">
                <span className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 ml-2">from yesterday</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Recent Transactions</h2>
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                 <div className="flex items-center space-x-3">
                   <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                     <span className="text-sm font-medium text-primary">
                       {transaction.customer.charAt(0)}
                     </span>
                   </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{transaction.customer}</p>
                    <p className="text-xs text-gray-500">{transaction.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{transaction.amount}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    transaction.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {transaction.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Quick Actions</h2>
                     <div className="grid grid-cols-2 gap-3">
             <button className="flex flex-col items-center justify-center p-4 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors duration-200">
               <ShoppingBag className="w-8 h-8 text-primary mb-2" />
               <span className="text-sm font-medium text-primary">New Sale</span>
             </button>
            <button className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200">
              <Users className="w-8 h-8 text-green-600 mb-2" />
              <span className="text-sm font-medium text-green-700">Add Customer</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors duration-200">
              <TrendingUp className="w-8 h-8 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-purple-700">View Reports</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors duration-200">
              <DollarSign className="w-8 h-8 text-orange-600 mb-2" />
              <span className="text-sm font-medium text-orange-700">Daily Summary</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage 