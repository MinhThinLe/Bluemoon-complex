session_token=$(curl localhost:3030 -H "Authorization: Basic YWRtaW46cGFzc3dvcmQK" -i 2> /dev/null | grep "Session-Token")

if [[ $session_token == "" ]]; then
    echo Server down
    exit 1
fi

cookie=$(echo $session_token | sed "s/set-cookie: //" | tr -d '[:space:]')

curl localhost:3030/api/new/fee-type \
    --cookie "Session-Token=XohImNooBHFR0OVvjcYpJ3NgPQ1qq73WKhHvch0VQtg=" \
    -H "Content-Type: application/json" \
    -d '{ "name": "new-fee-type" }'

