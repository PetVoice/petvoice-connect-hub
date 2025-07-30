import React from 'react';
import Layout from '@/components/Layout';
import { ContinuousLearningDashboard } from '@/components/ml/ContinuousLearningDashboard';

const MachineLearningPage: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <ContinuousLearningDashboard />
        </div>
      </div>
    </Layout>
  );
};

export default MachineLearningPage;