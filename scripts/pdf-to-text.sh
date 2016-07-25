
for f in pdf/profile/*.pdf;
do
  pdftotext -layout $f
  ft=${f%.pdf}
  mv $ft.txt text/
done

