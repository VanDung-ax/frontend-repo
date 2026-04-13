import { useState, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { uploadPredict } from '../../services/api'
import { MdCloudUpload, MdCheckCircle } from 'react-icons/md'

export default function TaiDuLieu() {
  const { user } = useAuth()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef()

  const handleFile = (f) => {
    setFile(f); setResult(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      const lines = e.target.result.split('\n').filter(l=>l.trim())
      const headers = lines[0].split(',').map(h=>h.replace(/"/g,'').trim())
      const rows = lines.slice(1,6).map(l=>{const v=l.split(',').map(x=>x.replace(/"/g,'').trim());return Object.fromEntries(headers.map((h,i)=>[h,v[i]||'']))})
      setPreview({ headers:headers.slice(0,6), rows, total: lines.length-1 })
    }
    reader.readAsText(f)
  }

  const handleSubmit = async () => {
    if (!file) return
    setLoading(true)
    try {
      const r = await uploadPredict(file, user?.id)
      setResult({ type:'success', text: r.data?.message || 'Phân tích hoàn tất!' })
    } catch (err) { setResult({ type:'danger', text: err.response?.data?.detail || 'Lỗi khi gửi.' }) }
    setLoading(false)
  }

  return (
    <div>
      <div className="page-header">
        <h1>Tải Dữ liệu & Dự báo AI</h1>
        <p>Chào mừng, {user?.display_name} — Tải lên file CSV để AI phân tích rủi ro sinh viên</p>
      </div>

      <div className="card card-body" style={{ maxWidth:700 }}>
        <div className="alert alert-info" style={{ marginBottom:16 }}>
          💡 File CSV cần có ít nhất các cột: MSSV, HoTen, Khoa, Nganh và 11 cột đặc trưng AI.
        </div>

        <div
          className={`dropzone${dragOver?' active':''}`}
          onDragOver={e=>{e.preventDefault();setDragOver(true)}}
          onDragLeave={()=>setDragOver(false)}
          onDrop={e=>{e.preventDefault();setDragOver(false);const f=e.dataTransfer.files[0];if(f)handleFile(f)}}
          onClick={()=>inputRef.current?.click()}
        >
          <input ref={inputRef} type="file" accept=".csv" hidden onChange={e=>e.target.files[0]&&handleFile(e.target.files[0])} />
          <div className="dropzone-icon">
            {file ? <MdCheckCircle style={{ color:'var(--success)' }} /> : <MdCloudUpload />}
          </div>
          <p>{file ? file.name : 'Chọn tệp CSV từ máy tính'}</p>
        </div>

        {preview && (
          <div style={{ marginTop:16 }}>
            <div style={{ fontWeight:700,marginBottom:8 }}>🔍 Xem trước ({preview.total} dòng):</div>
            <div className="table-wrapper" style={{ border:'1px solid var(--border)',borderRadius:8 }}>
              <table>
                <thead><tr>{preview.headers.map(h=><th key={h}>{h}</th>)}</tr></thead>
                <tbody>{preview.rows.map((r,i)=><tr key={i}>{preview.headers.map(h=><td key={h} style={{fontSize:12}}>{r[h]}</td>)}</tr>)}</tbody>
              </table>
            </div>
          </div>
        )}

        {result && <div className={`alert alert-${result.type}`} style={{ marginTop:16 }}>{result.text}</div>}

        {file && (
          <button className="btn btn-primary" style={{ marginTop:16,width:'100%',justifyContent:'center',padding:12 }} onClick={handleSubmit} disabled={loading}>
            {loading ? '⚙️ Đang gửi dữ liệu tới máy chủ AI...' : '🚀 Gửi dữ liệu & Dự đoán với AI'}
          </button>
        )}
      </div>
    </div>
  )
}
