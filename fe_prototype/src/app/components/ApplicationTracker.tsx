import { Application } from '../data/mockData';
import { Clock, Eye, Calendar, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ApplicationTrackerProps {
  applications: Application[];
}

export function ApplicationTracker({ applications }: ApplicationTrackerProps) {
  const getStatusConfig = (status: Application['status']) => {
    switch (status) {
      case 'sent':
        return {
          label: 'Đã gửi',
          icon: Clock,
          color: 'bg-blue-100 text-blue-700 border-blue-200',
          dotColor: 'bg-blue-500'
        };
      case 'viewed':
        return {
          label: 'HR đã xem',
          icon: Eye,
          color: 'bg-purple-100 text-purple-700 border-purple-200',
          dotColor: 'bg-purple-500'
        };
      case 'interview':
        return {
          label: 'Mời phỏng vấn',
          icon: Calendar,
          color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
          dotColor: 'bg-emerald-500'
        };
      case 'rejected':
        return {
          label: 'Từ chối',
          icon: XCircle,
          color: 'bg-gray-100 text-gray-700 border-gray-200',
          dotColor: 'bg-gray-500'
        };
    }
  };

  const sortedApplications = [...applications].sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  );

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <div className="text-2xl font-bold text-blue-700">
            {applications.filter(a => a.status === 'sent').length}
          </div>
          <div className="text-sm text-blue-600">Đã gửi</div>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
          <div className="text-2xl font-bold text-purple-700">
            {applications.filter(a => a.status === 'viewed').length}
          </div>
          <div className="text-sm text-purple-600">Đã xem</div>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
          <div className="text-2xl font-bold text-emerald-700">
            {applications.filter(a => a.status === 'interview').length}
          </div>
          <div className="text-sm text-emerald-600">Phỏng vấn</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <div className="text-2xl font-bold text-gray-700">
            {applications.filter(a => a.status === 'rejected').length}
          </div>
          <div className="text-sm text-gray-600">Từ chối</div>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-3">
        {sortedApplications.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-gray-600">Chưa có đơn ứng tuyển nào</p>
            <p className="text-sm text-gray-500 mt-1">
              Hãy vuốt sang phải để ứng tuyển công việc!
            </p>
          </div>
        ) : (
          sortedApplications.map((app) => {
            const statusConfig = getStatusConfig(app.status);
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={app.id}
                className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* Company Logo */}
                  <div className="text-4xl flex-shrink-0">{app.job.logo}</div>

                  {/* Job Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 mb-1">
                      {app.job.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {app.job.company}
                    </p>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusConfig.label}
                      </span>
                      {app.status === 'viewed' && app.viewedAt && (
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(app.viewedAt, { addSuffix: true })}
                        </span>
                      )}
                    </div>

                    {/* Timeline */}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>Ứng tuyển {formatDistanceToNow(app.appliedAt, { addSuffix: true })}</span>
                    </div>
                  </div>

                  {/* Salary */}
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-emerald-600">
                      {app.job.salaryNet}
                    </div>
                    <div className="text-xs text-gray-500">Net</div>
                  </div>
                </div>

                {/* Live Tracking Indicator */}
                {app.status === 'viewed' && (
                  <div className="mt-4 bg-purple-50 rounded-lg p-3 border border-purple-100">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <div className={`w-2 h-2 rounded-full ${statusConfig.dotColor}`} />
                        <div className={`absolute inset-0 w-2 h-2 rounded-full ${statusConfig.dotColor} animate-ping`} />
                      </div>
                      <span className="text-xs font-medium text-purple-700">
                        HR vừa mở CV của bạn lúc {app.viewedAt?.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
