session_token=$(curl localhost:3030 -H "Authorization: Basic YWRtaW46cGFzc3dvcmQK" -i 2> /dev/null | grep "Session-Token")

if [[ $session_token == "" ]]; then
    echo Server down
    exit 1
fi

cookie=$(echo $session_token | sed "s/set-cookie: //" | tr -d '[:space:]')

curl -f localhost:3030/api/new/fee-type \
    --cookie "$cookie" \
    -H "Content-Type: application/json" \
    -d '{ "name": "new-fee-type" }'

exit $?
