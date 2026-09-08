import { describe, expect, it } from 'vitest';
import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { PublicHostedZone } from 'aws-cdk-lib/aws-route53';
import { SesDomain } from './ses-domain.js';

describe('SesDomain', () => {
  it('creates an SES identity with Easy DKIM and a mail-from subdomain', () => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');
    const hostedZone = new PublicHostedZone(stack, 'Zone', { zoneName: 'sloth.example.com' });
    const ses = new SesDomain(stack, 'Email', { hostedZone });

    expect(ses.domain).toBe('sloth.example.com');
    expect(ses.mailFromDomain).toBe('mail.sloth.example.com');

    const template = Template.fromStack(stack);
    template.resourceCountIs('AWS::SES::EmailIdentity', 1);
    template.hasResourceProperties('AWS::SES::EmailIdentity', {
      EmailIdentity: 'sloth.example.com',
      MailFromAttributes: { MailFromDomain: 'mail.sloth.example.com' },
    });
  });

  it('honors mailFromPrefix and grants SendEmail', () => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');
    const hostedZone = new PublicHostedZone(stack, 'Zone', { zoneName: 'sloth.example.com' });
    const ses = new SesDomain(stack, 'Email', { hostedZone, mailFromPrefix: 'bounce' });
    const sender = new Role(stack, 'Sender', { assumedBy: new ServicePrincipal('lambda.amazonaws.com') });
    ses.grantSendEmail(sender);

    expect(ses.mailFromDomain).toBe('bounce.sloth.example.com');
    const json = JSON.stringify(Template.fromStack(stack).toJSON());
    expect(json).toContain('ses:SendEmail');
  });
});
