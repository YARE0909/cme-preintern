NAMESPACE="microservices"
LOGFILE="logs/k8s-monitor.log-$(date +%Y-%m-%d_%H-%M-%S).log"

declare -A LAST_RESTARTS
LAST_EVENT_TIMESTAMP=""

echo "---- Kubernetes Monitor Started ----" | tee -a "$LOGFILE"
echo "Namespace: $NAMESPACE" | tee -a "$LOGFILE"
echo "------------------------------------" | tee -a "$LOGFILE"

while true; do
    DATE=$(date +"%Y-%m-%d %H:%M:%S")
    ISSUES=0  

    echo "[$DATE] Checking cluster health..." >> "$LOGFILE"

    # 1. CHECK POD STATUS + RESTARTS

    PODS=$(kubectl get pods -n "$NAMESPACE" --no-headers 2>/dev/null)

    while read POD READY STATUS RESTARTS AGE; do
        
        # Pod not running
        if [[ "$STATUS" != "Running" ]]; then
            echo "[$DATE] Pod $POD not running (STATUS=$STATUS)" | tee -a "$LOGFILE"
            ISSUES=1
        fi

        # New restart
        if [[ -z "${LAST_RESTARTS[$POD]}" ]]; then
            LAST_RESTARTS[$POD]=$RESTARTS
        else
            if (( RESTARTS > LAST_RESTARTS[$POD] )); then
                echo "[$DATE] Pod $POD restarted. New count: $RESTARTS" | tee -a "$LOGFILE"
                LAST_RESTARTS[$POD]=$RESTARTS
                ISSUES=1
            fi
        fi

    done <<< "$PODS"

    # 2. CHECK DEPLOYMENT HEALTH (CORRECT PARSING)

    DEPLOYMENTS=$(kubectl get deployments -n "$NAMESPACE" --no-headers 2>/dev/null)

    while read DEP READY UP_TO_DATE AVAILABLE AGE; do
        READY_COUNT=$(echo "$READY" | cut -d'/' -f1)
        DESIRED=$(echo "$READY" | cut -d'/' -f2)

        if [[ "$READY_COUNT" != "$DESIRED" ]]; then
            echo "[$DATE] Deployment $DEP unhealthy: READY=$READY" | tee -a "$LOGFILE"
            ISSUES=1
        fi

    done <<< "$DEPLOYMENTS"

    # 3. CHECK KUBERNETES EVENTS

    EVENTS=$(kubectl get events -n "$NAMESPACE" --sort-by=.lastTimestamp --no-headers 2>/dev/null)

    while read LASTTS TYPE REASON OBJECT MSG; do
        # Only process events newer than last timestamp
        if [[ "$LASTTS" > "$LAST_EVENT_TIMESTAMP" ]]; then
            echo "[$DATE] EVENT: [$TYPE] $REASON on $OBJECT : $MSG" | tee -a "$LOGFILE"
            LAST_EVENT_TIMESTAMP="$LASTTS"
            ISSUES=1
        fi
    done <<< "$(kubectl get events -n "$NAMESPACE" --sort-by=.lastTimestamp --no-headers | awk '{print $1, $2, $3, $4, substr($0, index($0,$5))}')"

    # 4. EVERYTHING IS GOOD

    if [[ $ISSUES -eq 0 ]]; then
        echo "[$DATE] Everything is good." >> "$LOGFILE"
    fi

    sleep 5
done
