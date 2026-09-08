import type { Grant, IGrantable } from 'aws-cdk-lib/aws-iam';
import type { IPublicHostedZone } from 'aws-cdk-lib/aws-route53';
import { EmailIdentity, Identity } from 'aws-cdk-lib/aws-ses';
import { Construct } from 'constructs';

export interface SesDomainProps {
  /**
   * Hosted zone whose name is the sending domain (e.g. `sloth.bubbletech.io`).
   * Easy DKIM CNAMEs and MAIL FROM MX/SPF are added to this zone.
   */
  hostedZone: IPublicHostedZone;
  /** MAIL FROM subdomain prefix. Default `'mail'` → `mail.<domain>`. */
  mailFromPrefix?: string;
}

/**
 * Verified SES sending domain with Easy DKIM and a custom MAIL FROM.
 * The app supplies the hosted zone so reputation stays on that identity
 * (typically a product subdomain, not the parent org domain).
 */
export class SesDomain extends Construct {
  readonly identity: EmailIdentity;
  readonly domain: string;
  readonly mailFromDomain: string;

  constructor(scope: Construct, id: string, props: SesDomainProps) {
    super(scope, id);

    this.domain = props.hostedZone.zoneName.replace(/\.$/, '');
    this.mailFromDomain = `${props.mailFromPrefix ?? 'mail'}.${this.domain}`;
    this.identity = new EmailIdentity(this, 'Identity', {
      identity: Identity.publicHostedZone(props.hostedZone),
      mailFromDomain: this.mailFromDomain,
    });
  }

  grantSendEmail(grantee: IGrantable): Grant {
    return this.identity.grantSendEmail(grantee);
  }
}
