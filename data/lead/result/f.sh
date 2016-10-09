for file in *.pdf; do mv $file $(echo $file | cut -c 1-4 |  awk '{print $1".pdf"}'); done

