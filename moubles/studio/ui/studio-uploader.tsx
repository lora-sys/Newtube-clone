import { Button } from '@/components/ui/button';
import MuxUploader,{
    MuxUploaderDrop,
    MuxUploaderFileSelect,
    MuxUploaderProgress,
    MuxUploaderStatus
} from '@mux/mux-uploader-react';
import { UploadIcon} from 'lucide-react';


interface StudioloaderProps {
    endpoint :  string | null;
    onSuccess : () => void;
    onUploadStart?: () => void;                                                                                                             
}

const UPLOADER_ID = "video-uploader";
export const StudioUploader = ({
    endpoint,
    onSuccess,
    onUploadStart,
}: StudioloaderProps) => {
return (
    <div>
        <MuxUploader endpoint={endpoint}
        id={UPLOADER_ID}
        className='hidden group/uploader '
        onSuccess={onSuccess}
        onUploadStart={onUploadStart}
        />
        <MuxUploaderDrop muxUploader={UPLOADER_ID} className='group/drop' >
          <div slot="heading" className='flex flex-col items-center gap-6'>
            <div className='flex items-center justify-center gap-2 rounded-full bg-muted h-32 w-32'>
                <UploadIcon className='size-10 text-muted-foreground  group/drop-[&[active]]:animate-bounce transition-all duration-300' />
            </div>
                 <div className='flex flex-col gap-2 text-center'>
                     <p className='text-sm'>Drog and drop video  files upload</p>
                     <p className='text-xs text-muted-foreground'>
                        Your videos will be private until your publish them
                     </p>
                     <MuxUploaderFileSelect muxUploader={UPLOADER_ID}>
                           <Button type="button" className='rounded-full '>Select files</Button>
                     </MuxUploaderFileSelect>
                 </div>
          </div>
          <span slot="separator" className='hidden' />
          <MuxUploaderStatus
          muxUploader={UPLOADER_ID}
          className='text-sm'
          
          />
          <MuxUploaderProgress 
          muxUploader={UPLOADER_ID} className='text-sm'
          type="percentage"
          />
          <MuxUploaderProgress
          muxUploader={UPLOADER_ID}
          type="bar"
          />
        </MuxUploaderDrop>
    </div>
)
}