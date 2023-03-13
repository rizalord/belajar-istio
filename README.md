# Belajar Istio Service Mesh

## About

This is a repository of my learning results about Istio Service Mesh.

## Prerequisites

- Kubernetes Cluster
- Helm
- Helmfile

## Components
Here are the components that are included in this repository:
- [x] Istio
- [x] mTLS
- [x] Ingress Gateway
- [x] Authentication with JWKS
- [x] Kiali Dashboard
- [x] Prometheus
- [x] Grafana
- [ ] Jaeger Tracing

## Installation

1. Clone the repo
    
    ```bash
    git clone https://github.com/rizalord/belajar-istio.git
    ```

2. Move to chart directory
    
    ```bash
    cd belajar-istio/chart
    ```

3. Install all chart dependencies
    
    ```bash
    helmfile apply --concurrency=1
    ```

4. Set label to default namespace
    
    ```bash
    kubectl label namespace default  istio-injection=enabled --overwrite
    ```

5. Install main chart
        
    ```bash
    helm install belajar-istio .
    ```

## Access Kiali Dashboard
1. Get the status of kiali installation
    
    ```bash
    kubectl get kiali kiali -n istio-system -o jsonpath='{.status}'
    ```

2. Wait until property progress.message is equal to "7. Finished all resource creation".

3. Port forward kiali service
    
    ```bash
    kubectl port-forward svc/kiali 20001:20001 -n istio-system
    ```

4. Open browser and go to http://localhost:20001

## API Documentation
- Coming soon

## What I've Learned

While working on this project, I have learned a few things and here are some of my highlights:

1. Istio provide mTLS feature that can be used to secure communication between services. This feature can be enabled by default with no configuration needed.

2. Istio will automatically inject a sidecar container to every pod that has the label `istio-injection=enabled`. This sidecar container will be used to intercept the traffic and do the mTLS.

3. When we want to add a JWT Authentication, we can't use the symmetric approach. We have to use the asymmetric approach which is using JWKS. With this approach, all service that need authentication will have to fetch the JWKS from the JWKS URL. Instead of having to fetch JWKS for every incoming request, it's better to use a cache to store JWKS data.

4. Istio provide a dashboard called Kiali that can be used to visualize the traffic between services. To install Kiali, we must install Prometheus first. After that we need to install Grafana and Jaeger (optional). After all of the components are installed, we can install Kiali.

5. Workload in Istio means a pod, not a deployment. 

6. Gateway basically is an Ingress. So when we deploy it (eg. GKE), it will create a Load Balancer. Then when we want from outside (public) to access our cluster, we need to create a DNS record that points to the Load Balancer IP.



