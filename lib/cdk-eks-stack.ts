import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as iam from '@aws-cdk/aws-iam';
import * as eks from '@aws-cdk/aws-eks';


export class CdkEksStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);   

    const vpc = new ec2.Vpc(this, 'EKS-VPC', {
      cidr: '10.10.0.0/16',
      natGateways: 1
    })

    const mastersRole = new iam.Role(this, 'masters-role', {
      assumedBy: new iam.AccountRootPrincipal()
    });

    const fargateProfileRole = new iam.Role(this, "fargate-profile-role", {
      assumedBy: new iam.ServicePrincipal("eks-fargate-pods.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonEKSFargatePodExecutionRolePolicy")
      ]
    })

    const cluster = new eks.FargateCluster(this, "fargate-cluster", {
      clusterName: "EKS-Fargate",
      vpc,
      mastersRole,
      coreDnsComputeType: eks.CoreDnsComputeType.FARGATE,
      defaultProfile: {
         fargateProfileName: "default-profile",
          selectors: [
             { namespace: "default" },
             { namespace: "kube-system" }
         ],
         podExecutionRole: fargateProfileRole
      }
    });    
  }
}