NAMESPACE="microservices"
REPORT="reports/cluster-health-report-$(date +%Y-%m-%d_%H-%M-%S).log"

echo "-----------------------------------------------------" | tee -a "$REPORT"
echo "   Kubernetes Cluster Health Report" | tee -a "$REPORT"
echo "   Generated: $(date)" | tee -a "$REPORT"
echo "   Namespace: $NAMESPACE" | tee -a "$REPORT"
echo "-----------------------------------------------------" | tee -a "$REPORT"
echo "" | tee -a "$REPORT"

# 1. NODE STATUS
echo ">> NODE STATUS" | tee -a "$REPORT"
kubectl get nodes -o wide | tee -a "$REPORT"
echo "" | tee -a "$REPORT"

# 2. POD STATUS
echo ">> POD STATUS (All Pods in $NAMESPACE)" | tee -a "$REPORT"
kubectl get pods -n "$NAMESPACE" -o wide | tee -a "$REPORT"
echo "" | tee -a "$REPORT"

# 3. CHECK POD DESCRIPTIONS FOR WARNINGS
echo ">> POD DESCRIPTIONS (Warnings)" | tee -a "$REPORT"
for POD in $(kubectl get pods -n "$NAMESPACE" --no-headers | awk '{print $1}'); do
    echo "### Pod: $POD ###" | tee -a "$REPORT"
    kubectl describe pod "$POD" -n "$NAMESPACE" | grep -i "warning" -A4 | tee -a "$REPORT"
    echo "" | tee -a "$REPORT"
done

# 4. DEPLOYMENT STATUS
echo ">> DEPLOYMENT STATUS" | tee -a "$REPORT"
kubectl get deployments -n "$NAMESPACE" -o wide | tee -a "$REPORT"
echo "" | tee -a "$REPORT"

# 5. CHECK DEPLOYMENT HEALTH
echo ">> DEPLOYMENT HEALTH CHECK" | tee -a "$REPORT"
kubectl get deployments -n "$NAMESPACE" --no-headers | while read DEP READY UP_TO_DATE AVAILABLE AGE; do
    READY_COUNT=$(echo "$READY" | cut -d'/' -f1)
    DESIRED=$(echo "$READY" | cut -d'/' -f2)

    if [[ "$READY_COUNT" != "$DESIRED" ]]; then
        echo "Deployment $DEP is UNHEALTHY (READY=$READY)" | tee -a "$REPORT"
    else
        echo "Deployment $DEP is healthy (READY=$READY)" | tee -a "$REPORT"
    fi
done
echo "" | tee -a "$REPORT"

# 6. RESOURCE USAGE (CPU & MEMORY)
echo ">> RESOURCE USAGE (Pods)" | tee -a "$REPORT"
kubectl top pods -n "$NAMESPACE" 2>/dev/null | tee -a "$REPORT"
echo "" | tee -a "$REPORT"

echo ">> RESOURCE USAGE (Nodes)" | tee -a "$REPORT"
kubectl top nodes 2>/dev/null | tee -a "$REPORT"
echo "" | tee -a "$REPORT"

# 7. CLUSTER EVENTS (WARNINGS)
echo ">> WARNING EVENTS (Last 50)" | tee -a "$REPORT"
kubectl get events -n "$NAMESPACE" --sort-by=.lastTimestamp | grep -i warning | tail -n 50 | tee -a "$REPORT"
echo "" | tee -a "$REPORT"

# 8. SERVICE & ENDPOINT CHECK
echo ">> SERVICES IN NAMESPACE ($NAMESPACE)" | tee -a "$REPORT"
kubectl get svc -n "$NAMESPACE" -o wide | tee -a "$REPORT"
echo "" | tee -a "$REPORT"

echo ">> ENDPOINT CHECK" | tee -a "$REPORT"
kubectl get endpoints -n "$NAMESPACE" | tee -a "$REPORT"
echo "" | tee -a "$REPORT"

# 9. INGRESS CONNECTIVITY TEST
echo ">> INGRESS TEST (if ingress exists)" | tee -a "$REPORT"
INGRESS_IP=$(kubectl get ingress -n "$NAMESPACE" --no-headers 2>/dev/null | awk '{print $4}')

if [[ -n "$INGRESS_IP" ]]; then
    echo "Ingress IP: $INGRESS_IP" | tee -a "$REPORT"
    echo "Testing /user/health, /product/health, /order/health, /payment/health..." | tee -a "$REPORT"

    curl -s -o /dev/null -w "User-service HTTP status: %{http_code}\n" http://$INGRESS_IP/user/actuator/health | tee -a "$REPORT"
    curl -s -o /dev/null -w "Product-service HTTP status: %{http_code}\n" http://$INGRESS_IP/product/actuator/health | tee -a "$REPORT"
    curl -s -o /dev/null -w "Order-service HTTP status: %{http_code}\n" http://$INGRESS_IP/order/actuator/health | tee -a "$REPORT"
    curl -s -o /dev/null -w "Payment-service HTTP status: %{http_code}\n" http://$INGRESS_IP/payment/actuator/health | tee -a "$REPORT"
else
    echo "No ingress found." | tee -a "$REPORT"
fi
echo "" | tee -a "$REPORT"

# 10. CLOUD SQL PROXY HEALTH CHECK
echo ">> CLOUD SQL PROXY HEALTH (Sidecar check)" | tee -a "$REPORT"

for POD in $(kubectl get pods -n "$NAMESPACE" --no-headers | awk '{print $1}'); do
    echo "Checking Cloud SQL proxy in pod: $POD" | tee -a "$REPORT"
    kubectl logs "$POD" -n "$NAMESPACE" -c cloud-sql-proxy 2>/dev/null | tail -n 20 | tee -a "$REPORT"
    echo "" | tee -a "$REPORT"
done

# END REPORT
echo "-----------------------------------------------------" | tee -a "$REPORT"
echo "Cluster health report saved to: $REPORT" | tee -a "$REPORT"
echo "-----------------------------------------------------" | tee -a "$REPORT"
