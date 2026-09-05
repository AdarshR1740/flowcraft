import { CustomNode, CustomEdge, WorkflowMode } from '../types/workflow';

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  mode: WorkflowMode;
  nodes: CustomNode[];
  edges: CustomEdge[];
}

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'freeform-brainstorm',
    name: 'Ideation & Process Board',
    description: 'A clean freeform canvas with stickies, tasks, and 360° connections.',
    mode: 'freeform',
    nodes: [
      {
        id: 'start-f1',
        type: 'event',
        position: { x: 60, y: 140 },
        data: {
          label: 'Start',
          eventType: 'start',
        }
      },
      {
        id: 'sticky-1',
        type: 'sticky',
        position: { x: 260, y: 80 },
        data: {
          label: 'User Insight',
          description: 'Whiteboarding needs to be fast and frictionless.',
          color: '#fef08a' // Yellow
        }
      },
      {
        id: 'sticky-2',
        type: 'sticky',
        position: { x: 500, y: 80 },
        data: {
          label: 'Core Idea',
          description: 'Connect notes from any side (top, bottom, left, right).',
          color: '#bae6fd' // Light blue
        }
      },
      {
        id: 'task-f1',
        type: 'task',
        position: { x: 260, y: 260 },
        data: {
          label: 'Build Canvas Engine',
          role: 'Engineering',
        }
      },
      {
        id: 'task-f2',
        type: 'task',
        position: { x: 500, y: 260 },
        data: {
          label: 'Ship Minimal V1',
          role: 'Product',
        }
      },
      {
        id: 'end-f1',
        type: 'event',
        position: { x: 760, y: 270 },
        data: {
          label: 'Launch',
          eventType: 'end',
        }
      }
    ],
    edges: [
      { id: 'ef-1', source: 'start-f1', sourceHandle: 'right', target: 'task-f1', targetHandle: 'left' },
      { id: 'ef-2', source: 'sticky-1', sourceHandle: 'right', target: 'sticky-2', targetHandle: 'left' },
      { id: 'ef-3', source: 'sticky-1', sourceHandle: 'bottom', target: 'task-f1', targetHandle: 'top', style: { stroke: '#94a3b8', strokeDasharray: '4' } },
      { id: 'ef-4', source: 'task-f1', sourceHandle: 'right', target: 'task-f2', targetHandle: 'left' },
      { id: 'ef-5', source: 'task-f2', sourceHandle: 'right', target: 'end-f1', targetHandle: 'left' }
    ]
  },
  {
    id: 'customer-onboarding',
    name: 'Customer Onboarding SOP',
    description: 'Standard operating procedure for verifying, vetting, and provisioning new enterprise clients.',
    mode: 'structured',
    nodes: [
      {
        id: 'start-1',
        type: 'event',
        position: { x: 50, y: 150 },
        data: {
          label: 'Client Signed Contract',
          subtitle: 'CRM Webhook Triggered',
          eventType: 'start',
          role: 'Sales Ops',
          duration: 'Immediate',
          description: 'Triggered automatically when the Master Services Agreement is signed in DocuSign.',
          status: 'approved',
          checklist: [
            { id: 'c1', text: 'Confirm signed contract in DocuSign', done: true },
            { id: 'c2', text: 'Validate payment terms & billing contact', done: true }
          ],
          tools: [{ id: 't1', name: 'HubSpot CRM', url: 'https://hubspot.com' }]
        }
      },
      {
        id: 'task-1',
        type: 'task',
        position: { x: 320, y: 140 },
        data: {
          label: 'KYC & Compliance Verification',
          subtitle: 'Validate business identity and credit',
          role: 'Compliance Officer',
          duration: '2-4 hours',
          description: 'Run background checks, verify company registry details, and sanction list clearances.',
          status: 'approved',
          checklist: [
            { id: 'c3', text: 'Verify certificate of incorporation', done: true },
            { id: 'c4', text: 'Run AML/PEP automated screening', done: false },
            { id: 'c5', text: 'Obtain Ultimate Beneficial Owner (UBO) ID', done: false }
          ],
          tools: [
            { id: 't2', name: 'ComplyAdvantage', url: 'https://complyadvantage.com' },
            { id: 't3', name: 'Dun & Bradstreet' }
          ]
        }
      },
      {
        id: 'decision-1',
        type: 'decision',
        position: { x: 620, y: 130 },
        data: {
          label: 'KYC Passed?',
          subtitle: 'Risk score threshold: < 25',
          role: 'Risk Lead',
          duration: '15 mins',
          description: 'Evaluate if the compliance check passed all internal regulatory hurdles.',
          decisionOutputs: ['Approved', 'Manual Review Needed']
        }
      },
      {
        id: 'task-2',
        type: 'task',
        position: { x: 920, y: 50 },
        data: {
          label: 'Provision Workspace & DB',
          subtitle: 'Automated tenant configuration',
          role: 'DevOps / SysAdmin',
          duration: '30 mins',
          description: 'Spin up dedicated multi-tenant isolated partition and generate SSO credentials.',
          status: 'approved',
          checklist: [
            { id: 'c6', text: 'Initialize client AWS namespace', done: false },
            { id: 'c7', text: 'Configure SAML 2.0 / Okta integration', done: false },
            { id: 'c8', text: 'Seed initial database schema', done: false }
          ],
          tools: [{ id: 't4', name: 'AWS Console' }, { id: 't5', name: 'Okta' }]
        }
      },
      {
        id: 'task-3',
        type: 'task',
        position: { x: 920, y: 240 },
        data: {
          label: 'Escalate to Senior Legal',
          subtitle: 'High-risk account audit',
          role: 'General Counsel',
          duration: '1 business day',
          description: 'Requires explicit sign-off from legal director before any workspace setup.',
          status: 'in-review',
          checklist: [
            { id: 'c9', text: 'Draft risk mitigation memorandum', done: false },
            { id: 'c10', text: 'Schedule partner risk review committee', done: false }
          ]
        }
      },
      {
        id: 'end-1',
        type: 'event',
        position: { x: 1220, y: 60 },
        data: {
          label: 'Onboarding Completed',
          subtitle: 'Client live in production',
          eventType: 'end',
          role: 'Customer Success',
          duration: 'Final step',
          description: 'Send personalized welcome deck and schedule onboarding kickoff call.',
          status: 'approved',
          checklist: [
            { id: 'c11', text: 'Send intro email with login credentials', done: false },
            { id: 'c12', text: 'Schedule 30-min strategy sync', done: false }
          ]
        }
      }
    ],
    edges: [
      { id: 'e-1-2', source: 'start-1', target: 'task-1', animated: true },
      { id: 'e-2-3', source: 'task-1', target: 'decision-1' },
      { id: 'e-3-4', source: 'decision-1', target: 'task-2', label: 'Approved', style: { stroke: '#10b981' } },
      { id: 'e-3-5', source: 'decision-1', target: 'task-3', label: 'Requires Review', style: { stroke: '#f59e0b' } },
      { id: 'e-4-6', source: 'task-2', target: 'end-1', animated: true }
    ]
  }
];
