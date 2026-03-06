import { CheckCircle2 } from 'lucide-react';

export function Pricing() {
    const tiers = [
        {
            name: 'Hobby',
            price: '$0',
            description: 'Perfect for individual developers and open-source projects.',
            features: [
                'Up to 3 private repositories',
                'Unlimited public repositories',
                'Standard models (Llama 8B)',
                'Community support',
            ],
            buttonText: 'Get Started',
            popular: false,
        },
        {
            name: 'Pro',
            price: '$29',
            description: 'Advanced capabilities for professional developers and small teams.',
            features: [
                'Unlimited private repositories',
                'Advanced models (Kimi K2, Gemini Flash)',
                'Reasoning verifications (Deepseek R1)',
                'Priority email support',
                'Custom webhooks',
            ],
            buttonText: 'Start Free Trial',
            popular: true,
        },
        {
            name: 'Enterprise',
            price: 'Custom',
            description: 'Dedicated resources and custom integrations for large organizations.',
            features: [
                'Custom SSO & SAML integration',
                'Dedicated account manager',
                'On-premise deployment options',
                'SLA guarantees (99.9% uptime)',
                'Custom fine-tuned models',
            ],
            buttonText: 'Contact Sales',
            popular: false,
        },
    ];

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 py-20 px-4 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-16">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                        Simple, Transparent Pricing
                    </h1>
                    <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                        Choose the plan that fits your workflow. From weekend projects to enterprise deployments, we have you covered.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    {tiers.map((tier, idx) => (
                        <div key={idx} className={`relative bg-white dark:bg-neutral-900 border ${tier.popular ? 'border-indigo-500 shadow-indigo-100 dark:shadow-indigo-900/20 shadow-xl' : 'border-neutral-200 dark:border-neutral-800 shadow-sm'} p-8 rounded-2xl flex flex-col h-full transition-colors duration-300`}>
                            {tier.popular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                    Most Popular
                                </div>
                            )}
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                                <p className="text-neutral-500 dark:text-neutral-400 text-sm h-10">{tier.description}</p>
                            </div>
                            <div className="mb-6">
                                <span className="text-5xl font-extrabold">{tier.price}</span>
                                {tier.name !== 'Enterprise' && <span className="text-neutral-500 dark:text-neutral-400 font-medium">/mo</span>}
                            </div>
                            <ul className="space-y-4 mb-8 flex-1">
                                {tier.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3 text-neutral-700 dark:text-neutral-300">
                                        <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                                        <span className="text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <button className={`w-full py-3 px-4 rounded-xl font-semibold transition-colors ${tier.popular
                                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                    : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white'
                                }`}>
                                {tier.buttonText}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
